"""Collect Kyrgyzstan development-sector information for sectors.html.

Run by .github/workflows/update-sectors.yml; the output directory is published
to the `sector-data` branch.

  index.json        - update time, years held, per-sector statistics
  items-YYYY.json   - government moves, press coverage and donor / NGO news,
                      sorted into 20 sectors, translated into Japanese.
                      Accumulates run after run; a backfill pass walks back
                      month by month so past coverage is filled in too.
  projects.json     - donor projects (current and past) from the World Bank
                      projects API and IATI (via d-portal), refreshed daily.

JICA and other Japanese cooperation is included (donor ids "jica" / "jp"),
with Japanese-language sources as well; the page can hide it.

usage: fetch_sectors.py OUT_DIR
"""
import hashlib
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_news as fn  # noqa: E402  (shared helpers: get, rss_items, translate_batch, ...)
import ai_classify  # noqa: E402

# With an API key, Claude judges relevance, sectors, government moves and real cooperation;
# keywords then only pre-select. Without one, the keyword classification is final.
AI_ON = ai_classify.enabled()
AI = None

log, get, clean = fn.log, fn.get, fn.clean


def stem_re(words):
    """Like fn.word_re, but in a phrase every word but the last is a stem too:
    "всемирн банк" matches "всемирный банк" and "всемирного банка"."""
    parts = []
    for w in words:
        w = w.strip().lower()
        if " " not in w:
            parts.append(fn.word_re([w]).pattern)
            continue
        ws = w.split()
        body = r"[\w-]*\s+".join(re.escape(x) for x in ws)
        parts.append(r"(?<![а-яёa-z])" + body)
    return re.compile("|".join(parts))
NOW = datetime.now(timezone.utc)
START = time.time()
TIME_BUDGET = int(os.environ.get("TIME_BUDGET", 80 * 60))  # seconds for the whole run
BASE = os.environ.get("PREV_BASE", "https://raw.githubusercontent.com/yuuuta21/kyrgyzcha-family/sector-data/")
KEEP_YEARS = 4
BACKFILL_MONTHS = 36


def time_left():
    return TIME_BUDGET - (time.time() - START)


# ---------------------------------------------------------------- sectors
# id, Japanese label, Russian/English matching stems (see fn.word_re),
# Russian search terms, English search terms
SECTORS = [
    ("urban", "都市・地域開発",
     ["градостро", "генплан", "урбаниз", "жилищн", "жиль", "жкх", "благоустр", "застройк", "многоэтаж", "новостро",
      "регионального развития", "развития регион", "умный город", "городск инфраструкт", "микрорайон", "новострой",
      "urban", "housing", "municipal", "regional development", "city development", "smart city"],
     ["градостроительство", "генплан", "жилье", "благоустройство", "ЖКХ", "\"развитие регионов\""],
     ["urban", "housing", "municipal", "\"regional development\""]),
    ("transport", "運輸交通",
     ["дорог", "автодорог", "трасс", "мост", "железн", "ж/д", "аэропорт", "авиа", "транспорт", "автобус", "троллейбус",
      "электробус", "логист", "перевал", "тоннел", "туннел", "китай-кыргызстан-узбекистан", "кку",
      "road", "highway", "railway", "railroad", "airport", "transport", "bridge", "logistic", "aviation", "transit"],
     ["дорога", "трасса", "\"железная дорога\"", "аэропорт", "транспорт", "логистика"],
     ["road", "railway", "airport", "transport", "logistics", "corridor"]),
    ("energy", "資源・エネルギー",
     ["энерг", "электроэнерг", "электростанц", "гэс", "тэц", "гидро", "камбар-ат", "газ", "газа", "газо", "нефт", "уголь",
      "угля", "угольн", "недр", "месторожд", "золот", "горнодоб", "рудник", "кумтор", "солнечн", "сэс", "ветров", "вэс",
      "возобновля", "casa-1000", "каса-1000", "энергосбер", "электросет", "нэск", "минэнерго",
      "energy", "electricity", "power plant", "hydropower", "hpp", "solar", "wind farm", "mining", "gold", "coal",
      "renewable", "kambarata", "casa-1000"],
     ["энергетика", "ГЭС", "электроэнергия", "\"солнечная электростанция\"", "месторождение", "горнодобывающ"],
     ["energy", "hydropower", "electricity", "mining", "solar", "Kambarata"]),
    ("private", "民間セクター開発",
     ["бизнес", "предприним", "мсб", "малого и среднего", "инвест", "экспорт", "торговл", "туризм", "туристическ",
      "промышлен", "производств", "швейн", "вто", "свободн экономическ", "сэз", "стартап", "делового климат",
      "инвестиционн климат", "кластер", "ремесл",
      "business", "sme", "entrepreneur", "investment", "investor", "export", "trade", "tourism", "industry",
      "private sector", "manufactur", "startup"],
     ["бизнес", "предприниматели", "инвестиции", "экспорт", "туризм", "промышленность"],
     ["business", "SME", "investment", "export", "tourism", "\"private sector\""]),
    ("agri", "農業・農村開発",
     ["сельск хозяйств", "сельского хозяйства", "сельхоз", "аграр", "фермер", "животновод", "скот", "пастбищ", "урожа",
      "посев", "зерн", "пшениц", "хлопок", "ирригац", "орошен", "ветеринар", "сельск местност", "пчел", "садовод",
      "рыбовод", "минсельхоз", "агро", "теплиц", "мелиорац",
      "agricultur", "farm", "livestock", "pasture", "irrigation", "crop", "rural", "agri", "veterinar", "harvest"],
     ["\"сельское хозяйство\"", "фермеры", "животноводство", "урожай", "агро", "пастбища"],
     ["agriculture", "farmers", "livestock", "rural", "irrigation"]),
    ("health", "保健医療",
     ["здравоохр", "больниц", "медицин", "минздрав", "вакцин", "привив", "туберкул", "вич", "эпидем", "корь", "кори",
      "врач", "поликлин", "фап", "лекарств", "аптек", "омс", "онколог", "роддом", "материнск", "пациент", "минздрав",
      "health", "hospital", "medical", "vaccin", "tuberculosis", "hiv", "clinic", "maternal", "patient", "immuniz"],
     ["здравоохранение", "больница", "Минздрав", "вакцинация", "туберкулез", "медицина"],
     ["health", "hospital", "vaccination", "tuberculosis", "healthcare"]),
    ("nutrition", "栄養改善",
     ["питани", "недоедан", "анеми", "истощен", "задержк роста", "обогащ", "йодир", "продовольственн безопасн",
      "продовольствен", "голод",
      "nutrition", "malnutrition", "stunting", "anemia", "anaemia", "food security", "school feeding", "school meal"],
     ["питание", "\"школьное питание\"", "\"продовольственная безопасность\"", "анемия"],
     ["nutrition", "\"food security\"", "\"school feeding\"", "malnutrition"]),
    ("education", "教育",
     ["образован", "школ", "учител", "вуз", "университет", "студент", "детск сад", "детсад", "дошкольн", "орт",
      "абитуриент", "учебник", "минобразован", "профтех", "колледж", "лицей", "гимнази", "выпускник", "педагог",
      "education", "school", "teacher", "universit", "student", "kindergarten", "vocational", "tvet", "pupil"],
     ["образование", "школа", "учителя", "вуз", "\"детский сад\"", "Минобразования"],
     ["education", "school", "teachers", "university", "vocational"]),
    ("social", "社会保障・障害と開発",
     ["социальн защит", "социальной защиты", "пособи", "пенси", "инвалид", "овз", "ограниченными возможност",
      "малоимущ", "бедност", "соцфонд", "социального фонда", "сирот", "опек", "трудов мигра", "мигрант", "миграц",
      "занятост", "безработ", "особыми потребност", "минтруд", "соцработ",
      "social protection", "pension", "disabilit", "poverty", "migrant", "migration", "employment", "orphan",
      "social assistance", "unemploy"],
     ["\"социальная защита\"", "пособия", "пенсии", "инвалидность", "мигранты", "бедность"],
     ["\"social protection\"", "disability", "poverty", "migrants", "pensions"]),
    ("sports", "スポーツと開発",
     ["спорт", "олимпи", "атлет", "игры кочевник", "игр кочевник", "футбол", "борьб", "борец", "физкульт", "стадион",
      "тренер", "паралимп", "сборн",
      "sport", "olympic", "athlet", "stadium", "football", "nomad games", "paralymp"],
     ["спорт", "\"Игры кочевников\"", "спортсмены", "олимпиада", "стадион"],
     ["sport", "\"World Nomad Games\"", "athletes", "Olympic"]),
    ("peace", "平和構築",
     ["границ", "пограничн", "делимитац", "демаркац", "конфликт", "беженц", "экстремизм", "радикализ", "межэтническ",
      "примирен", "миротвор", "одкб", "вооружен", "приграничн", "мирн соглашен", "добрососедств",
      "border", "conflict", "peacebuild", "extremis", "refugee", "interethnic", "reconciliation", "radicali"],
     ["граница", "делимитация", "приграничье", "конфликт", "экстремизм", "Баткен"],
     ["border", "conflict", "peacebuilding", "extremism", "Batken"]),
    ("governance", "ガバナンス",
     ["коррупц", "госслужб", "государственн служб", "госуправлен", "правосуд", "судебн", "верховенств", "выбор", "цик",
      "местн самоуправлен", "местного самоуправления", "айыл окмот", "жогорку кенеш", "парламент", "депутат",
      "конституц", "генпрокурат", "антикорруп", "сми", "свобод слов", "прав человек", "права человека", "омбудсмен",
      "акыйкатчы", "госуслуг", "государственных услуг", "законопроект", "административн реформ",
      "governance", "corruption", "election", "parliament", "judicia", "rule of law", "human rights", "civil service",
      "local self-government", "ombudsman", "transparen", "accountab", "civil society", "media freedom"],
     ["коррупция", "госслужба", "\"местное самоуправление\"", "выборы", "\"Жогорку Кенеш\"", "законопроект"],
     ["governance", "corruption", "election", "parliament", "\"human rights\"", "\"civil society\""]),
    ("finance", "公共財政・金融システム",
     ["бюджет", "налог", "минфин", "госдолг", "внешн долг", "внешнего долга", "нацбанк", "нбкр", "инфляц", "курс сом",
      "банк", "кредит", "микрофинанс", "ипотек", "облигац", "гнс", "таможн", "страхован", "исламск финанс",
      "финансов грамотн", "казначейств", "госзакуп",
      "budget", "tax", "public debt", "external debt", "central bank", "national bank", "inflation", "banking",
      "public finance", "microfinance", "bond", "fiscal", "procurement", "remittance"],
     ["бюджет", "налоги", "госдолг", "Нацбанк", "инфляция", "Минфин"],
     ["budget", "tax", "debt", "\"National Bank\"", "inflation", "fiscal"]),
    ("gender", "ジェンダー平等",
     ["женщин", "гендер", "девочек", "девушк", "насили в семье", "семейн насил", "домашн насил", "ала качуу",
      "похищени невест", "кража невест", "ранн брак", "равноправ", "женск", "многодетн мат",
      "women", "gender", "girls", "domestic violence", "bride kidnapping", "early marriage", "gbv", "empowerment"],
     ["женщины", "гендер", "\"семейное насилие\"", "\"ала качуу\"", "девочки"],
     ["women", "gender", "\"domestic violence\"", "\"bride kidnapping\"", "girls"]),
    ("digital", "デジタル化",
     ["цифров", "цифровиз", "ит", "айти", "интернет", "электронн правительств", "тундук", "5g", "сотов", "мобильн связ", "оператор связ",
      "телеком", "кибер", "искусственн интеллект", "ии", "блокчейн", "майнинг", "парк высоких технолог", "пвт",
      "минцифр", "электронн подпис", "цифровое",
      "digital", "ict", "internet", "e-government", "cyber", "artificial intelligence", "telecom", "tunduk",
      "broadband", "fintech", "high technology park"],
     ["цифровизация", "\"цифровое\"", "интернет", "\"Парк высоких технологий\"", "Тундук", "кибербезопасность"],
     ["digital", "ICT", "internet", "e-government", "\"High Technology Park\""]),
    ("climate", "気候変動",
     ["климат", "парников", "углерод", "декарбониз", "ледник", "таяни", "зелен экономик", "зеленой экономики",
      "зеленая экономика", "cop2", "cop3", "кс-2", "адаптац", "углеродн",
      "climate", "glacier", "emission", "carbon", "cop29", "cop30", "cop31", "green economy", "adaptation",
      "net zero", "greenhouse"],
     ["климат", "\"изменение климата\"", "ледники", "\"зеленая экономика\"", "выбросы"],
     ["climate", "glaciers", "\"green economy\"", "emissions", "adaptation"]),
    ("nature", "自然環境保全",
     ["биоразнообраз", "заповедн", "нацпарк", "национальн парк", "лес", "леса", "лесн", "лесов", "барс", "охот",
      "браконь", "флор", "фаун", "экосистем", "особо охраняем", "ооpt", "оопт", "редк вид", "красн книг",
      "лесовосстан", "озеленен", "посадк деревьев",
      "biodiversity", "forest", "snow leopard", "protected area", "wildlife", "ecosystem", "nature reserve",
      "national park", "reforestation"],
     ["биоразнообразие", "заповедник", "лес", "\"снежный барс\"", "браконьерство", "\"национальный парк\""],
     ["biodiversity", "forest", "\"snow leopard\"", "\"protected area\"", "wildlife"]),
    ("envmgmt", "環境管理",
     ["эколог", "загрязн", "смог", "качеств воздух", "качества воздуха", "отход", "мусор", "свалк", "полигон тбо",
      "тбо", "переработк", "утилизац", "хвостохранил", "уранов", "сточн", "выброс", "мусоросжиг", "пластик",
      "pollution", "air quality", "waste", "landfill", "recycl", "tailings", "uranium", "smog", "plastic",
      "wastewater"],
     ["экология", "загрязнение", "смог", "мусор", "отходы", "хвостохранилища"],
     ["pollution", "\"air quality\"", "waste", "landfill", "tailings", "uranium"]),
    ("water", "水資源・水供給",
     ["питьев вод", "питьевой воды", "питьевая вода", "водоснабж", "водоотвед", "канализац", "водоканал",
      "водн ресурс", "водных ресурсов", "ирригац", "оросит", "водохранил", "токтогул", "водопровод", "арык",
      "водосбер", "вододел", "водопольз", "очистн сооружен",
      "water supply", "drinking water", "sanitation", "irrigation", "wastewater", "water resource", "reservoir",
      "toktogul"],
     ["\"питьевая вода\"", "водоснабжение", "ирригация", "канализация", "\"водные ресурсы\"", "водохранилище"],
     ["\"drinking water\"", "\"water supply\"", "irrigation", "sanitation", "\"water resources\""]),
    ("drr", "防災・災害リスク削減",
     ["мчс", "землетряс", "сель$", "селя$", "сели$", "селев", "оползн", "лавин", "паводк", "наводнен", "стихийн",
      "чс", "чрезвычайн", "спасател", "сейсм", "эвакуац", "пострадавш", "ликвидац последств", "камнепад",
      "disaster", "earthquake", "mudflow", "landslide", "avalanche", "flood", "emergency", "seismic", "drr",
      "resilien"],
     ["МЧС", "землетрясение", "сель", "оползень", "лавина", "паводок"],
     ["disaster", "earthquake", "mudflow", "landslide", "flood", "avalanche"]),
]
# Japanese words for Japanese-language articles (matched as plain substrings)
JA_SECTOR = {
    "urban": ["都市", "住宅", "地域開発"], "transport": ["道路", "鉄道", "空港", "交通", "橋梁", "物流", "トンネル"],
    "energy": ["エネルギー", "電力", "発電", "水力", "鉱業", "鉱山"], "private": ["中小企業", "投資", "輸出", "観光", "産業", "ビジネス", "民間セクター", "一村一品", "人材開発センター"],
    "agri": ["農業", "農村", "畜産", "灌漑", "農家", "生乳", "酪農", "獣医"], "health": ["保健", "医療", "病院", "ワクチン", "感染症"],
    "nutrition": ["栄養", "給食", "食料安全"], "education": ["教育", "学校", "大学", "教員", "留学"],
    "social": ["社会保障", "障害", "移民", "貧困", "雇用"], "sports": ["スポーツ", "柔道", "五輪", "オリンピック"],
    "peace": ["国境", "平和構築", "紛争"], "governance": ["行政", "ガバナンス", "汚職", "議会", "選挙", "法整備"],
    "finance": ["財政", "予算", "税関", "徴税", "金融", "中央銀行", "公共財政"], "gender": ["ジェンダー", "女性"],
    "digital": ["デジタル", "ict", "it人材", "電子政府", "情報通信", "放送"], "climate": ["気候変動", "氷河", "脱炭素"],
    "nature": ["生物多様性", "森林", "自然保護", "自然環境", "ユキヒョウ", "林産"], "envmgmt": ["廃棄物", "ごみ", "大気汚染", "環境管理"],
    "water": ["上水道", "水供給", "給水", "下水", "水資源"], "drr": ["防災", "地震", "災害", "土石流", "洪水"],
}
SECTOR_RES = [(sid, re.compile(stem_re(words).pattern + "|" + "|".join(re.escape(w.lower()) for w in JA_SECTOR.get(sid, []))))
              for sid, _, words, _, _ in SECTORS]
SECTOR_IDS = [s[0] for s in SECTORS]

# ---------------------------------------------------------------- actors
# id, Japanese label, group, stems (Russian / English / Kyrgyz)
DONORS = [
    ("wb", "世界銀行", "mdb", ["всемирн банк", "всемирного банка", "всемирным банком", "world bank", "ifc", "мфк", "ida "]),
    ("adb", "アジア開発銀行", "mdb", ["азиатск банк развития", "азиатского банка развития", "азиатский банк развития",
                                    "абр", "asian development bank", "adb"]),
    ("ebrd", "欧州復興開発銀行", "mdb", ["ебрр", "европейск банк реконструкц", "ebrd"]),
    ("imf", "IMF", "mdb", ["мвф", "международн валютн фонд", "imf", "international monetary fund"]),
    ("aiib", "アジアインフラ投資銀行", "mdb", ["абии", "азиатск банк инфраструктурн", "aiib"]),
    ("isdb", "イスラム開発銀行", "mdb", ["исламск банк развития", "isdb", "islamic development bank"]),
    ("edb", "ユーラシア開発銀行", "mdb", ["еабр", "евразийск банк развития", "евразийского банка развития",
                                       "eurasian development bank", "eabr"]),
    ("eu", "EU", "bilateral", ["евросоюз", "европейск союз", "европейского союза", "представительство ес", "ес выдел",
                              "european union", "eu delegation", "eu-funded", "team europe"]),
    ("us", "米国（USAID等）", "bilateral", ["usaid", "юсаид", "агентство сша по международному развитию",
                                         "посольство сша", "us embassy", "u.s. embassy"]),
    ("de", "ドイツ（GIZ/KfW）", "bilateral", ["giz", "гиз", "kfw", "кфв", "германск", "германии", "germany", "german"]),
    ("ch", "スイス（SDC等）", "bilateral", ["швейцар", "sdc", "switzerland", "swiss", "helvetas", "хелветас"]),
    ("uk", "英国", "bilateral", ["великобритан", "британск", "fcdo", "united kingdom", "british embassy"]),
    ("kr", "韓国（KOICA等）", "bilateral", ["koica", "койка", "южная корея", "южной кореи", "республики корея", "korea"]),
    ("tr", "トルコ（TIKA等）", "bilateral", ["tika", "тика", "турци", "turkey", "türkiye", "turkiye"]),
    ("cn", "中国", "bilateral", ["китай", "китая", "кнр", "china", "chinese"]),
    ("ru", "ロシア（RKDF等）", "bilateral", ["рфкр", "российско-кыргызск фонд развития", "ркфр", "россотрудничеств",
                                          "russian-kyrgyz development fund"]),
    ("obi", "その他の二国間（北欧・欧州・カナダ等）", "bilateral",
     ["швеци", "финлянд", "дани", "норвеги", "нидерланд", "канад", "франци", "австри", "sweden", "swedish", "sida",
      "finland", "denmark", "danish", "norway", "netherlands", "canada", "canadian", "france", "french", "afd",
      "austria"]),
    ("gulf", "湾岸・アラブ諸国基金", "bilateral", ["саудовск фонд", "кувейтск фонд", "абу-даби", "фонд опек", "opec fund",
                                              "saudi fund", "kuwait fund", "abu dhabi fund", "qatar fund"]),
    ("undp", "UNDP", "un", ["проон", "программа развития оон", "undp"]),
    ("unicef", "UNICEF", "un", ["юнисеф", "unicef"]),
    ("who", "WHO", "un", ["воз", "всемирн организац здравоохран", "world health organization"]),
    ("fao", "FAO", "un", ["фао", "fao"]),
    ("wfp", "WFP", "un", ["впп", "всемирн продовольствен программ", "wfp", "world food programme"]),
    ("unfpa", "UNFPA", "un", ["юнфпа", "фонд оон в области народонаселения", "unfpa"]),
    ("unwomen", "UN Women", "un", ["оон-женщины", "структура оон-женщины", "un women"]),
    ("unhcr", "UNHCR", "un", ["увкб", "unhcr"]),
    ("iom", "IOM", "un", ["мом", "международн организац по миграц", "iom"]),
    ("unesco", "UNESCO", "un", ["юнеско", "unesco"]),
    ("ilo", "ILO", "un", ["мот", "международн организац труда", "ilo"]),
    ("unep", "UNEP", "un", ["юнеп", "unep"]),
    ("un", "国連（その他）", "un", ["оон", "united nations", "un resident coordinator", "unodc", "уннп", "ifad", "мфср",
                                 "unido", "юнидо", "unops", "юнопс", "unaids", "юнэйдс"]),
    ("gcf", "気候基金（GCF/GEF等）", "fund", ["зелен климатическ фонд", "зеленого климатического фонда", "гэф",
                                          "глобальн экологическ фонд", "green climate fund", "gcf", "gef",
                                          "adaptation fund", "фонд адаптации"]),
    ("gf", "保健基金（GF/Gavi）", "fund", ["глобальн фонд", "глобального фонда", "gavi", "гави", "global fund"]),
    ("akdn", "アガ・ハーン財団", "ngo", ["ага хан", "ага-хан", "aga khan", "akdn", "уца", "университет центральной азии"]),
    ("osce", "OSCE", "un", ["обсе", "osce"]),
    ("jica", "JICA", "japan", ["jica", "джайка", "жайка", "джика", "японск агентств международн сотрудничеств",
                               "japan international cooperation agency", "国際協力機構", "ジャイカ", "協力隊"]),
    ("jp", "日本（大使館・その他）", "japan", ["посольство японии", "правительство японии", "япония", "японии",
                                         "японск", "japan", "japanese", "日本政府", "日本大使館", "草の根",
                                         "無償資金協力", "円借款", "日本センター", "日本人材開発センター"]),
    ("ngo", "NGO・市民団体", "ngo", ["нко", "нпо", "общественн фонд", "общественного фонда", "общественн объединен",
                                  "неправительствен", "гражданск обществ", "mercy corps", "мерси корпс",
                                  "save the children", "world vision", "ворлд вижн", "care international",
                                  "caritas", "каритас", "красн полумесяц", "красного полумесяца", "red crescent",
                                  "сорос", "soros", "ngo", "non-governmental", "civil society organi", "habitat for humanity",
                                  "plan international", "oxfam", "оксфам", "hivos", "camp alatoo", "кэмп алатоо"]),
]
DONOR_RES = [(did, stem_re(words)) for did, _, _, words in DONORS]
# loans or grants and the like: words that make a donor mention "cooperation" news
COOP_RE = re.compile(stem_re(["грант", "кредит", "заём", "заем", "займ", "проект", "программ", "финансир", "соглашен",
                      "меморандум", "техническ помощ", "содейств", "поддержк", "выдел", "партнер", "сотруднич",
                      "grant", "loan", "project", "programme", "program", "financ", "agreement", "memorandum",
                      "support", "partnership", "assistance", "cooperation", "fund"]
                     ).pattern + "|協力|支援|無償|借款|事業|プロジェクト|研修|寄贈|署名|贈与|調査")
NOT_DEV_RE = stem_re(["матч", "футболист", "чемпионат мира по футболу"])


# government actors / documents
GOV_DOMAINS = ("gov.kg", "egov.kg", "president.kg", "kenesh.kg", "nbkr.kg", "stat.kg", "med.kg", "minfin.kg", "mfa.kg",
               "kabar.kg", "edu.gov.kg", "mchs.gov.kg", "stat.gov.kg", "sti.gov.kg", "mz.gov.kg")
GOV_RE = stem_re(["кабмин", "кабинет министров", "кабинета министров", "министерств", "министр", "минфин",
                     "минздрав", "минобразован", "минэконом", "минсельхоз", "минтранс", "минэнерго", "минприроды",
                     "минцифр", "минтруд", "минкульт", "мчс", "нацбанк", "нбкр", "жогорку кенеш", "жапаров",
                     "президент кыргыз", "президента кыргыз", "президент кр", "постановлен", "указ$", "указа$", "указом", "указе$", "законопроект", "распоряжен", "касымалиев",
                     "госагентств", "государственн агентств", "госкомитет", "государственн комитет", "полпред",
                     "правительство кыргыз", "правительства кыргыз", "национальн программ", "нпа", "подписал закон",
                     "вице-премьер", "заместитель председателя кабинета",
                     "cabinet of ministers", "ministry", "minister", "president japarov", "government of kyrgyz",
                     "kyrgyz government", "jogorku kenesh", "parliament approved", "decree"])

# ---------------------------------------------------------------- sources
LOCAL_FEEDS = list(fn.LOCAL_FEEDS) + [
    ("Кабар", "https://kabar.kg/rss/"),
    ("Акипресс", "https://akipress.org/rss/news.rss"),
    ("Vesti.kg", "https://vesti.kg/index.php?format=feed&type=rss"),
    ("Sputnik Кыргызстан", "https://ru.sputnik.kg/export/rss2/archive/index.xml"),
    ("Times of Central Asia", "https://timesca.com/feed/"),
    ("Eurasianet", "https://eurasianet.org/region/kyrgyzstan/feed"),
]
# official sites that may offer RSS; failures are logged and ignored
GOV_FEEDS = [
    ("Кабинет Министров", "https://www.gov.kg/ru/rss"),
    ("Президент КР", "https://www.president.kg/ru/rss"),
    ("Жогорку Кенеш", "http://www.kenesh.kg/ru/rss"),
    ("Нацбанк", "https://www.nbkr.kg/rss.jsp?lang=RUS"),
]
GN_RU = dict(hl="ru", gl="KG", ceid="KG:ru")
GN_EN = dict(hl="en-US", gl="US", ceid="US:en")
GN_JA = dict(hl="ja", gl="JP", ceid="JP:ja")
JA_QUERIES = ["キルギス JICA", "キルギス (無償資金協力 OR 円借款 OR 技術協力)", "キルギス 協力隊",
              "キルギス (草の根 OR 日本大使館)", "キルギス site:jica.go.jp", "キルギス (政府 OR 大統領 OR 開発)"]
GOV_QUERIES = [
    ("site:gov.kg", 7), ("site:president.kg", 7), ("site:kenesh.kg", 14), ("site:kabar.kg Кабмин OR министерство", 3),
    ("Кабинет Министров Кыргызстан постановление", 7), ("Кыргызстан министерство утвердил", 7),
    ("Жогорку Кенеш законопроект", 7), ("Жапаров подписал закон", 14), ("Кыргызстан национальная программа развития", 30),
]
DONOR_QUERIES_RU = [
    "Кыргызстан (\"Всемирный банк\" OR АБР OR ЕБРР OR МВФ OR ЕАБР OR АБИИ)",
    "Кыргызстан (ПРООН OR ЮНИСЕФ OR ВОЗ OR ФАО OR ВПП OR ЮНФПА OR МОМ OR ЮНЕСКО OR ОБСЕ)",
    "Кыргызстан (USAID OR GIZ OR KfW OR KOICA OR TIKA OR Евросоюз OR Швейцария)",
    "Кыргызстан (грант OR \"техническая помощь\" OR \"соглашение о финансировании\") донор",
    "Кыргызстан (НКО OR \"общественный фонд\" OR \"гражданское общество\") проект",
    "Кыргызстан (\"Ага Хан\" OR \"Красный Полумесяц\" OR \"Mercy Corps\" OR Helvetas OR \"Save the Children\")",
    "Кыргызстан (\"Зеленый климатический фонд\" OR \"Глобальный фонд\" OR \"Фонд ОПЕК\" OR \"Саудовский фонд\" OR ИБР)",
]
DONOR_QUERIES_EN = [
    "Kyrgyzstan (\"World Bank\" OR ADB OR EBRD OR IMF OR AIIB OR \"Eurasian Development Bank\")",
    "Kyrgyz Republic (UNDP OR UNICEF OR WHO OR FAO OR WFP OR UNFPA OR IOM OR UNESCO)",
    "Kyrgyzstan (USAID OR GIZ OR KfW OR KOICA OR TIKA OR \"European Union\" OR Switzerland)",
    "Kyrgyzstan (grant OR loan OR \"technical assistance\") project",
    "Kyrgyzstan (NGO OR \"civil society\" OR \"Aga Khan\" OR \"Mercy Corps\" OR Helvetas)",
    "Kyrgyzstan (site:worldbank.org OR site:adb.org OR site:undp.org OR site:unicef.org OR site:ebrd.com)",
    "Kyrgyzstan (site:eeas.europa.eu OR site:un.org OR site:who.int OR site:fao.org OR site:wfp.org)",
]


def gn_url(query, region):
    return "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": query, **region})


def item_id(title, source):
    return hashlib.sha1((norm_title(title) + "|" + (source or "")).encode()).hexdigest()[:12]


def norm_title(t):
    return re.sub(r"[^\w]+", " ", (t or "").lower()).strip()


def host_of(url):
    try:
        return urllib.parse.urlparse(url).hostname or ""
    except Exception:
        return ""


def is_gov_host(h):
    return any(h == d or h.endswith("." + d) for d in GOV_DOMAINS)


# donor names that would otherwise read as sector words ("банк" -> finance)
ORG_NAME_RE = re.compile(r"(всемирн|азиатск|европейск|евразийск|исламск|германск)\w*\s+банк\w*( развития| реконструкции и развития)?"
                         r"|world bank|development bank|investment bank|bank for reconstruction|national bank of"
                         r"|monetary fund|валютн\w* фонд\w*|(глобальн|климатическ|экологическ)\w* фонд\w*", re.I)


def sector_ids(text):
    text = ORG_NAME_RE.sub(" ", text.lower())
    return [sid for sid, rx in SECTOR_RES if rx.search(text)]


# not a policy move even when an official is named; and adverts
NOT_GOV_RE = stem_re(["помилован", "помиловать", "мошенник", "осторожно", "приговор", "задержан", "суд приговорил",
                      "pardon", "scam", "sentenced"])
AD_RE = stem_re(["подписк", "подписаться", "скидк", "реклам", "subscription", "advertis"])
NEWSPAPER_TAIL = re.compile(r"[|｜][^|｜]*(新聞|ニュース|デジタル|news|online|digital)[^|｜]*", re.I)
# forecasts and commentary about a donor are not cooperation
NOT_COOP_RE = stem_re(["прогноз", "прогнозиру", "оценил", "ожидает рост", "forecast", "projects growth", "outlook",
                       "見通し", "予測"])


def classify(title, lead, link, source, query_gov=False):
    """Return (sectors, donors, gov) or None when the item is out of scope."""
    title = NEWSPAPER_TAIL.sub(" ", title)  # "…｜朝刊・夕刊ニュース｜下野新聞デジタル" is the paper, not the topic
    text = unicodedata.normalize("NFKC", title + " " + lead).lower()  # ＪＩＣＡ -> jica
    if AD_RE.search(text):
        return None
    sectors = sector_ids(text)
    donors = [did for did, rx in DONOR_RES if rx.search(text)]
    # a donor named in passing (e.g. "China" in a trade story) counts only with a cooperation word
    if donors and (not COOP_RE.search(text) or NOT_COOP_RE.search(text)):
        donors = [d for d in donors if d in ("jica", "jp")]  # JICA and Japan stay tagged whenever named
    if "jica" in donors and "jp" in donors:
        donors.remove("jp")
    if NOT_DEV_RE.search(text):
        donors = []
    h = host_of(link)
    gov = (is_gov_host(h) and h not in ("kabar.kg",) or bool(GOV_RE.search(text)) or (query_gov and bool(sectors))) \
        and not NOT_GOV_RE.search(text)
    if not sectors and not donors and not gov and not AI_ON:
        return None
    return sectors, donors, gov


# ---------------------------------------------------------------- collecting

def strip_source(title, source):
    if source and title.endswith(" - " + source):
        return title[: -len(source) - 3].strip()
    return re.sub(r"\s+[-–—|]\s+[^-–—|]{2,40}$", "", title).strip() if " - " in title else title


KG_HOSTS = ("timesca.com", "eurasianet.org", "akipress.com", "azattyk.org", "rus.azattyk.org", "kloop.kg",
            "vb.kg", "sputnik.kg", "economist.kg", "tazabek.kg", "knews.kg", "kaktus.media", "kabar.kg")


def kg_host(h):
    return h.endswith(".kg") or any(h == d or h.endswith("." + d) for d in KG_HOSTS)


def kg_related(text):
    return bool(fn.KG_RE.search(text.lower())) or bool(re.search(r"kyrgyz|bishkek|кыргыз|киргиз|キルギス|ビシュケク", text, re.I))


def collect(archive_empty):
    """Fetch every live source; returns a list of raw items."""
    out = []

    def add(title, lead, link, source, published, lang, query_gov=False, need_kg=True):
        title = clean(title)
        lead = clean(lead)
        if not title or not link:
            return
        if need_kg and not kg_related(title + " " + lead):
            return
        c = classify(title, lead, link, source, query_gov)
        if not c:
            return
        sectors, donors, gov = c
        out.append({"i": item_id(title, source), "t": title, "l": fn.first_sentences(lead, 300) if lead else "",
                    "u": link, "s": source, "p": published.isoformat() if published else NOW.isoformat(),
                    "c": sectors, "d": donors, "g": 1 if gov else 0, "lang": lang})

    for source, url in LOCAL_FEEDS + GOV_FEEDS:
        try:
            got = list(fn.rss_items(url))
        except Exception as e:
            log(f"feed {source}: failed: {e}")
            continue
        is_gov_feed = (source, url) in GOV_FEEDS
        n0 = len(out)
        for it in got:
            desc = it["desc"]
            if desc.startswith("kloop.kg"):
                desc = desc[len("kloop.kg"):].strip()
            lang = "en" if re.search(r"[a-z]{4}", it["title"]) and not re.search(r"[а-яё]", it["title"], re.I) else "ru"
            add(it["title"], desc, it["link"], source, it["date"], lang, query_gov=is_gov_feed,
                need_kg=not is_gov_feed and source not in ("Кабар",))
        log(f"feed {source}: {len(got)} fetched, {len(out) - n0} kept")

    ru_days = 60 if archive_empty else 7
    en_days = 60 if archive_empty else 14
    queries = []
    for q, d in GOV_QUERIES:
        queries.append((f"{q} when:{max(d, ru_days if archive_empty else d)}d", GN_RU, "ru", True))
    for sid, _, _, ru_terms, en_terms in SECTORS:
        queries.append((f"(Кыргызстан OR Бишкек OR Кыргызской) ({' OR '.join(ru_terms)}) when:{ru_days}d", GN_RU, "ru", False))
        queries.append((f"(Kyrgyzstan OR \"Kyrgyz Republic\") ({' OR '.join(en_terms)}) when:{en_days}d", GN_EN, "en", False))
    for q in DONOR_QUERIES_RU:
        queries.append((f"{q} when:{ru_days}d", GN_RU, "ru", False))
    for q in DONOR_QUERIES_EN:
        queries.append((f"{q} when:{en_days}d", GN_EN, "en", False))
    for q in ["Кыргызстан (JICA OR Япония OR японский) (грант OR проект OR помощь)",
              "Kyrgyzstan (JICA OR Japan) (grant OR project OR assistance)"]:
        queries.append((f"{q} when:{ru_days}d", GN_RU if "Кыр" in q else GN_EN, "ru" if "Кыр" in q else "en", False))
    for q in JA_QUERIES:
        queries.append((f"{q} when:{max(ru_days, 30)}d", GN_JA, "ja", False))
    out.extend(run_gnews(queries))
    return out


def run_gnews(queries):
    out = []
    for q, region, lang, qgov in queries:
        if time_left() < 30 * 60:
            log("gnews: out of time")
            break
        try:
            got = list(fn.rss_items(gn_url(q, region)))
        except Exception as e:
            log(f"gnews {q!r}: failed: {e}")
            time.sleep(2)
            continue
        n = 0
        for it in got:
            source = it["source_el"] or host_of(it["source_url"])
            if any(s in source for s in fn.SKIP_SOURCES):
                continue
            title = strip_source(it["title"], source)
            text = title.lower()
            if lang == "ja" and not kg_related(title):
                continue  # e.g. JICA's domestic pages found by site:jica.go.jp
            if not kg_related(title) and not kg_host(host_of(it["source_url"])):
                continue
            c = classify(title, "", it["link"], source, qgov or is_gov_host(host_of(it["source_url"])))
            if not c:
                continue
            sectors, donors, gov = c
            if is_gov_host(host_of(it["source_url"])) and host_of(it["source_url"]) != "kabar.kg":
                gov = True
            out.append({"i": item_id(title, source), "t": title, "l": "", "u": it["link"], "s": source,
                        "p": (it["date"] or NOW).isoformat(), "c": sectors, "d": donors, "g": 1 if gov else 0,
                        "lang": lang, "src_host": host_of(it["source_url"])})
            n += 1
        log(f"gnews {q[:70]!r}: {len(got)} fetched, {n} kept")
        time.sleep(1.0)
    return out


def backfill_queries(cursor):
    """One past month per run: every sector, Russian and English, plus donors."""
    first = date(NOW.year, NOW.month, 1)
    m = cursor % BACKFILL_MONTHS + 1  # months back
    y, mo = first.year, first.month - m
    while mo <= 0:
        mo += 12
        y -= 1
    start = date(y, mo, 1)
    end = date(y + (mo == 12), mo % 12 + 1, 1)
    rng = f"after:{start.isoformat()} before:{end.isoformat()}"
    qs = []
    for sid, _, _, ru_terms, en_terms in SECTORS:
        qs.append((f"Кыргызстан ({' OR '.join(ru_terms)}) {rng}", GN_RU, "ru", False))
        qs.append((f"Kyrgyzstan ({' OR '.join(en_terms)}) {rng}", GN_EN, "en", False))
    for q in DONOR_QUERIES_RU[:5]:
        qs.append((f"{q} {rng}", GN_RU, "ru", False))
    for q in DONOR_QUERIES_EN[:5]:
        qs.append((f"{q} {rng}", GN_EN, "en", False))
    for q, _ in GOV_QUERIES[:5]:
        qs.append((f"{q} {rng}", GN_RU, "ru", True))
    for q in JA_QUERIES[:4]:
        qs.append((f"{q} {rng}", GN_JA, "ja", False))
    return start, qs


# ---------------------------------------------------------------- archive

def load_prev():
    items, meta = {}, {}
    try:
        meta = json.loads(get(BASE + "index.json"))
    except Exception as e:
        log(f"no previous index: {e}")
        return items, meta
    for y in meta.get("years", []):
        try:
            for x in json.loads(get(BASE + f"items-{y}.json")).get("items", []):
                items[x["i"]] = x
        except Exception as e:
            log(f"items-{y}: failed: {e}")
    log(f"previous: {len(items)} items")
    return items, meta


def merge(store, new):
    added = 0
    by_title = {norm_title(x["t"]): k for k, x in store.items()}
    for x in new:
        k = x["i"]
        dup = by_title.get(norm_title(x["t"]))
        if k not in store and dup:
            k = dup
        if k in store:
            old = store[k]
            # keep translations and the resolved link; widen keyword tags (AI judgements stand)
            if not old.get("ai"):
                old["c"] = sorted(set(old.get("c", [])) | set(x["c"]), key=SECTOR_IDS.index)
                old["d"] = sorted(set(old.get("d", [])) | set(x["d"]))
                old["g"] = 1 if (old.get("g") or x["g"]) else 0
            if not old.get("l") and x.get("l"):
                old["l"] = x["l"]
                old.pop("lj", None)
            if "news.google.com" in old.get("u", "") and "news.google.com" not in x["u"]:
                old["u"] = x["u"]
            continue
        x.pop("src_host", None)
        x["c"] = sorted(set(x["c"]), key=SECTOR_IDS.index)
        x["d"] = sorted(set(x["d"]))
        store[k] = x
        by_title[norm_title(x["t"])] = k
        added += 1
    return added


def reclassify(store):
    """Apply the current keyword lists to stored items (lists improve over time)."""
    for k in list(store):
        x = store[k]
        if x.get("lang") == "ja" and not kg_related(x["t"]):
            del store[k]
            continue
        if x.get("ai"):
            continue
        if not AI_ON and not kg_related(x["t"] + " " + x.get("l", "")) and not kg_host(host_of(x.get("u", ""))) \
                and "news.google.com" not in x.get("u", ""):
            del store[k]  # e.g. a UNDP story about Tanzania found through site:undp.org
            continue
        c = classify(x["t"], x.get("l", ""), x.get("u", ""), x.get("s", ""))
        if c is None and not AI_ON:
            del store[k]
            continue
        if c:
            x["c"] = sorted(set(c[0]), key=SECTOR_IDS.index)
            x["d"] = sorted(set(c[1]))
            x["g"] = 1 if c[2] else 0


def title_stems(t):
    return {w[:6] for w in re.findall(r"[a-zа-яё0-9]{4,}", (t or "").lower())} - fs_stop()


def fs_stop():
    return {"кыргыз", "киргиз", "бишкек", "kyrgyz", "bishkek", "республ", "стране", "будет", "этого", "также"}


def group_duplicates(store):
    """Mark later reports of the same story (mostly the same words, within 2 days) as copies of the first one."""
    xs = sorted((x for x in store.values() if not x.get("hide")), key=lambda x: x["p"])
    for x in xs:
        x.pop("dup", None)
    recent, groups = [], 0
    for x in xs:
        st = title_stems(x["t"])
        ts = datetime.fromisoformat(x["p"].replace("Z", "+00:00"))
        recent = [(r, rs, rt) for r, rs, rt in recent if (ts - rt).total_seconds() < 2 * 86400]
        if len(st) >= 5:
            for r, rs, rt in recent:
                if len(st & rs) / len(st | rs) >= 0.62:
                    x["dup"] = r.get("dup") or r["i"]
                    groups += 1
                    break
        recent.append((x, st, ts))
    log(f"duplicates: {groups} items marked as repeats")


def translate_store(store, budget):
    for x in store.values():
        if x.get("lang") == "ja" and "tj" not in x:
            x["tj"] = x["t"]
            if x.get("l"):
                x["lj"] = x["l"]
    todo = [x for x in store.values() if "tj" not in x]
    todo.sort(key=lambda x: x["p"], reverse=True)
    done = 0
    for x in todo:
        if done >= budget or time_left() < 12 * 60:
            break
        try:
            texts = [x["t"]] + ([x["l"]] if x.get("l") else [])
            tr = fn.translate_batch(texts)
            x["tj"] = tr[0]
            if x.get("l"):
                x["lj"] = tr[1] if len(tr) > 1 else ""
            done += 1
            time.sleep(0.35)
        except Exception as e:
            log(f"translate failed: {e}")
            time.sleep(3)
    log(f"translated {done}, {len(todo) - done} left")


def resolve_links(store, budget):
    todo = [x for x in store.values() if "news.google.com" in x.get("u", "")]
    todo.sort(key=lambda x: x["p"], reverse=True)
    done = 0
    for x in todo[:budget]:
        if time_left() < 25 * 60:  # leave time for the AI, translation and projects
            break
        real = fn.resolve_gnews(x["u"])
        if real != x["u"]:
            x["u"] = real
            done += 1
    for k in [k for k, x in store.items() if x.get("_drop")]:
        del store[k]
    log(f"resolved {done} Google News links")


# ---------------------------------------------------------------- projects

def to_date(s):
    """'2023-05-31T00:00:00Z', '2023-05-31' or '6/30/2028 12:00:00 AM' -> '2023-05-31'."""
    if not s:
        return None
    s = str(s).strip()
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        return m.group(0)
    m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)
    if m:
        return f"{m.group(3)}-{int(m.group(1)):02d}-{int(m.group(2)):02d}"
    return None


def strings_in(v):
    if isinstance(v, str):
        yield v
    elif isinstance(v, dict):
        for x in v.values():
            yield from strings_in(x)
    elif isinstance(v, list):
        for x in v:
            yield from strings_in(x)


def num(v):
    try:
        return float(str(v).replace(",", "")) if v not in (None, "") else None
    except Exception:
        return None


def wb_projects():
    out, os_ = [], 0
    while True:
        url = ("https://search.worldbank.org/api/v2/projects?format=json&countrycode_exact=KG&rows=200&os="
               + str(os_))
        data = json.loads(get(url, timeout=60))
        projs = data.get("projects") or {}
        rows = list(projs.values()) if isinstance(projs, dict) else list(projs)
        for p in rows:
            pid = p.get("id")
            if not pid:
                continue
            st = (p.get("status") or "").lower()
            status = "active" if st == "active" else "pipeline" if st == "pipeline" else \
                "dropped" if st == "dropped" else "closed"
            sect_text = " ".join(s for k, v in p.items() if k.startswith(("sector", "theme", "mjsector", "mjtheme"))
                                 for s in strings_in(v))
            abstract = p.get("project_abstract")
            if isinstance(abstract, dict):
                abstract = abstract.get("cdata") or ""
            out.append({
                "id": "WB-" + pid, "src": "wb", "donor": "wb", "org": "World Bank",
                "t": clean(p.get("project_name") or ""), "x": fn.first_sentences(clean(abstract or ""), 300),
                "st": status, "a": to_date(p.get("boardapprovaldate")), "e": to_date(p.get("closingdate")),
                "amt": num(p.get("totalcommamt")) or num(p.get("totalamt")), "cur": "USD",
                "impl": clean(p.get("impagency") or ""), "kind": clean(p.get("lendinginstr") or ""),
                "sch": scheme_of("wb", p.get("lendinginstr") or ""),
                "u": f"https://projects.worldbank.org/en/projects-operations/project-detail/{pid}",
                "_sect": sect_text,
            })
        total = int(data.get("total") or 0)
        os_ += 200
        if not rows or os_ >= total or os_ > 3000:
            break
        time.sleep(1)
    log(f"world bank: {len(out)} projects")
    return out


DESC_AMT = re.compile(r"(?:up to|of|totall?ing|amounting to)\s+(EUR|€|USD|US\$|\$)\s?([\d.,]+)\s*(million|mln|m\b|billion|bn)", re.I)
FX_USD = {"EUR": 1.08, "€": 1.08, "USD": 1.0, "US$": 1.0, "$": 1.0}


def desc_amount(text):
    """'providing a loan of up to EUR 2 million' -> USD amount of the first stated sum."""
    m = DESC_AMT.search(text or "")
    if not m:
        return None
    try:
        v = float(m.group(2).replace(",", ""))
    except ValueError:
        return None
    v *= 1e9 if m.group(3).lower() in ("billion", "bn") else 1e6
    return round(v * FX_USD.get(m.group(1).upper() if m.group(1) != "€" else "€", 1.0))


# redacted titles and agency running costs say nothing about cooperation in Kyrgyzstan
IATI_JUNK = re.compile(r"redacted|pay and benefits|program support|programme support costs|operating expense|"
                       r"administrative cost|^ope?x?$|^usaid pio$", re.I)
BIG_LENDERS = {"wb", "adb", "ebrd", "isdb", "aiib", "edb", "imf"}
# One set of cooperation forms for every donor (after the OECD DAC aid types); each source's own
# label stays in "kind".
SCH_LOAN, SCH_GRANT, SCH_TA, SCH_BUDGET, SCH_EMERG, SCH_OTHER = (
    "融資（事業）", "無償資金（事業・機材）", "技術協力", "財政・政策支援", "緊急・復興支援", "その他・不明")
WB_SCHEME = [(r"development policy|structural adjustment|sector adjustment|program-for-results|programmatic", SCH_BUDGET),
             (r"technical assistance", SCH_TA), (r"emergency|rehabilitation", SCH_EMERG), (r".", SCH_LOAN)]


def scheme_of(src, kind="", aid_type="", finance_type=""):
    k = (kind or "").lower()
    if src == "jica":
        return SCH_LOAN if "有償" in k or "円借款" in k else SCH_GRANT if "無償" in k else SCH_TA if k else SCH_OTHER
    if src == "wb":
        return next(sch for rx, sch in WB_SCHEME if re.search(rx, k))
    at, ft = str(aid_type or "").upper(), str(finance_type or "")
    if at.startswith("A"):
        return SCH_BUDGET
    if at.startswith(("D", "E")):
        return SCH_TA
    if at.startswith("C") or ft:
        return SCH_LOAN if ft.startswith("4") else SCH_GRANT if ft.startswith(("1", "110")) or at.startswith("C") else SCH_OTHER
    return SCH_OTHER


IATI_STATUS = {"1": "pipeline", "2": "active", "3": "active", "4": "closed", "5": "dropped", "6": "suspended"}
# DAC 5-digit purpose codes -> sector ids (by prefix; first match wins)
DAC_MAP = [
    ("12240", "nutrition"), ("52010", "nutrition"), ("15170", "gender"), ("15180", "gender"), ("1511", "finance"),
    ("15142", "finance"), ("152", "peace"), ("151", "governance"), ("16010", "social"), ("16011", "social"),
    ("16020", "social"), ("16015", "social"), ("1606", "sports"), ("16050", "social"), ("16030", "urban"),
    ("16040", "urban"), ("111", "education"), ("112", "education"), ("113", "education"), ("114", "education"),
    ("121", "health"), ("122", "health"), ("123", "health"), ("130", "health"), ("140", "water"), ("210", "transport"),
    ("220", "digital"), ("23", "energy"), ("240", "finance"), ("250", "private"), ("311", "agri"), ("31220", "nature"),
    ("312", "nature"), ("313", "agri"), ("321", "private"), ("322", "energy"), ("323", "private"), ("331", "private"),
    ("332", "private"), ("41010", "envmgmt"), ("41020", "envmgmt"), ("41030", "nature"), ("41040", "nature"),
    ("41050", "drr"), ("410", "envmgmt"), ("43030", "urban"), ("43040", "agri"), ("43060", "drr"), ("430", "governance"),
    ("720", "drr"), ("730", "drr"), ("740", "drr"),
]


def dac_sector(code):
    code = str(code or "")
    for pre, sid in DAC_MAP:
        if code.startswith(pre):
            return sid
    return None


def day_to_date(v):
    try:
        v = float(v)
        if v <= 0:
            return None
        return (date(1970, 1, 1) + timedelta(days=int(v))).isoformat()
    except Exception:
        return to_date(v)


def iati_projects():
    base = "https://d-portal.org/q?"
    fields = ("aid,title,reporting,reporting_ref,funder_ref,status_code,day_start,day_end,commitment,spend,description,"
              "country_percent")
    rows = []
    try:
        data = json.loads(get(base + urllib.parse.urlencode(
            {"from": "act,country", "country_code": "KG", "limit": 20000, "select": fields}), timeout=180))
        rows = data.get("rows") or []
    except Exception as e:
        log(f"d-portal select failed ({e}), trying without select")
        data = json.loads(get(base + urllib.parse.urlencode(
            {"from": "act,country", "country_code": "KG", "limit": 20000}), timeout=180))
        rows = data.get("rows") or []
    forms = {}
    try:
        data = json.loads(get(base + urllib.parse.urlencode(
            {"from": "trans,country", "country_code": "KG", "limit": 60000,
             "select": "aid,trans_aid_code,trans_finance_code"}), timeout=240))
        for r in data.get("rows") or []:
            if r.get("aid") and (r.get("trans_aid_code") or r.get("trans_finance_code")) and r["aid"] not in forms:
                forms[r["aid"]] = (r.get("trans_aid_code") or "", str(r.get("trans_finance_code") or ""))
        log(f"d-portal forms: {len(forms)} activities")
    except Exception as e:
        log(f"d-portal forms failed: {e}")
    sectors = {}
    try:
        data = json.loads(get(base + urllib.parse.urlencode(
            {"from": "act,country,sector", "country_code": "KG", "limit": 20000,
             "select": "aid,sector_code,sector_percent"}), timeout=180))
        for r in data.get("rows") or []:
            sid = dac_sector(r.get("sector_code"))
            if sid and r.get("aid"):
                sectors.setdefault(r["aid"], set()).add(sid)
    except Exception as e:
        log(f"d-portal sectors failed: {e}")
    out, seen = [], set()
    today = NOW.date().isoformat()
    for r in rows:
        aid = r.get("aid")
        if not aid or aid in seen:
            continue
        seen.add(aid)
        org = clean(r.get("reporting") or "")
        ref = (r.get("reporting_ref") or "").strip()
        title = clean(r.get("title") or "")
        desc = clean(r.get("description") or "")
        if ref in ("44000", "XM-DAC-44000") or aid.startswith("44000-"):
            continue  # covered by the World Bank API
        start, end = day_to_date(r.get("day_start")), day_to_date(r.get("day_end"))
        st = IATI_STATUS.get(str(r.get("status_code") or "").split(".")[0])
        if not st:
            st = "closed" if end and end < today else "active"
        if st == "active" and end and end < str(int(today[:4]) - 1):
            st = "closed"  # stale reporting
        if not title or IATI_JUNK.search(title):
            continue
        amt = num(r.get("commitment")) or num(r.get("spend"))
        amt_from_text = False
        if not amt:  # e.g. EBRD reports no transactions, but its descriptions state the financing
            amt = desc_amount(desc)
            amt_from_text = bool(amt)
        pct = num(r.get("country_percent"))
        if amt and pct and 0 < pct < 100:
            amt = amt * pct / 100  # multi-country activity: Kyrgyzstan's share only
        elif amt and pct is None and amt > 1e8 and donor_of(org + " " + ref) not in BIG_LENDERS:
            amt = None  # share unknown for a large programme: don't count a global total against one country
        out.append({"id": aid, "src": "iati", "donor": donor_of(org + " " + ref), "org": org, "t": title,
                    "x": fn.first_sentences(desc, 300), "st": st, "a": start, "e": end,
                    "amt": amt, "cur": "USD", "ref": ref, "amtx": 1 if amt_from_text else None,
                    "sch": scheme_of("iati", "", *forms.get(aid, ("", ""))),
                    "u": "https://d-portal.org/ctrack.html#view=act&aid=" + urllib.parse.quote(aid),
                    "_sect": "", "_dac": sorted(sectors.get(aid, []))})
    log(f"iati: {len(rows)} rows, {len(out)} projects")
    probe = [p for p in out if p["donor"] == "ebrd" and not p.get("amt")][:2]
    for p in probe:  # EBRD reports no commitment here: keep its raw records to find where the amount is
        for table in ("act", "budget", "trans"):
            try:
                raw = get(base + urllib.parse.urlencode({"from": table, "aid": p["id"], "limit": 50}), timeout=60)
                open(os.path.join(DEBUG_DIR, f"dportal-{table}-{re.sub(r'[^A-Za-z0-9-]', '_', p['id'])[:40]}.json"), "wb").write(raw)
            except Exception as e:
                log(f"probe {table}: {e}")
    return out


ORG_DONOR = [
    ("wb", r"world bank"),
    ("jica", r"japan international cooperation|xm-dac-701-8|\bjica\b"), ("jp", r"\bjapan|xm-dac-701-"),
    ("adb", r"asian development bank|xm-dac-46004"), ("ebrd", r"european bank for reconstruction|xm-dac-46015|ebrd"),
    ("imf", r"international monetary fund"), ("aiib", r"asian infrastructure"), ("isdb", r"islamic development"),
    ("edb", r"eurasian development"), ("eu", r"european (commission|union)|xi-iati-ec|dg near|dg intpa|xm-dac-918"),
    ("us", r"united states|usaid|us-gov|millennium challenge|xm-dac-302"), ("de", r"germany|giz|kfw|de-|bmz|xm-dac-5-"),
    ("ch", r"switzerland|swiss|sdc|ch-|xm-dac-11-"), ("uk", r"united kingdom|fcdo|gb-gov|dfid"),
    ("kr", r"korea|koica|office for government policy coordination"),
    ("obi", r"sweden|finland|denmark|norway|netherlands|canada|dfatd|global affairs canada|\bafd\b|agence fran|"
            r"france|austria|slovak|czech|belgium|ireland|luxembourg|iceland|new zealand|australia|poland"),
    ("cn", r"aiddata|china"), ("tr", r"türkiye|turkey|tika"), ("undp", r"undp|united nations development programme"),
    ("unicef", r"unicef"), ("who", r"world health organi"), ("fao", r"food and agriculture organi|\bfao\b"),
    ("wfp", r"world food programme|\bwfp\b"), ("unfpa", r"unfpa|population fund"), ("unwomen", r"un women|un-women"),
    ("unhcr", r"unhcr|refugees"), ("iom", r"migration|\biom\b"), ("unesco", r"unesco"), ("ilo", r"labour organi|\bilo\b"),
    ("unep", r"environment programme|unep"), ("gcf", r"green climate|global environment facility|adaptation fund"),
    ("gf", r"global fund|gavi"), ("akdn", r"aga khan"), ("osce", r"osce"),
    ("un", r"united nations|unops|unodc|ifad|unido|unaids|\bun-|un pooled|unocha|cerf"),
]
ORG_DONOR_RES = [(d, re.compile(rx, re.I)) for d, rx in ORG_DONOR]


def donor_of(text):
    for d, rx in ORG_DONOR_RES:
        if rx.search(text):
            return d
    return "ngo"


def finish_projects(projs, prev):
    prev_by = {p["id"]: p for p in (prev or {}).get("projects", [])}
    today = NOW.date().isoformat()
    for p in projs:
        # reports lag: anything past its end date has finished, whatever the status code says
        if p.get("st") == "active" and p.get("e") and p["e"] < today:
            p["st"] = "closed"
        elif p.get("st") == "active" and p.get("a") and p["a"] > today:
            p["st"] = "pipeline"
        text = (p["t"] + " " + p.get("x", "") + " " + p.pop("_sect", "")).lower()
        sect = set(sector_ids(text)) | set(p.pop("_dac", []))
        p["c"] = sorted(sect, key=SECTOR_IDS.index)
        old = prev_by.get(p["id"])
        if old and old.get("ai") and old.get("t") == p["t"]:
            p["c"], p["ai"] = old.get("c", []), old["ai"]  # keep the AI judgement
        elif old:
            p["c"] = sorted(set(p["c"]) | set(old.get("c", [])), key=SECTOR_IDS.index)
        if old:
            if old.get("t") == p["t"] and old.get("tj"):
                p["tj"] = old["tj"]
    translate_projects(projs)
    for p in projs:
        for k in [k for k, v in p.items() if v in (None, "", [])]:
            del p[k]
    projs.sort(key=lambda p: (p.get("a") or ""), reverse=True)
    return projs


def translate_projects(projs):
    budget = int(os.environ.get("PROJECT_TR_BUDGET", 700))
    todo = [p for p in projs if not p.get("tj")]
    todo.sort(key=lambda p: (p["st"] != "active", p["st"] != "pipeline", -(int((p.get("a") or "0")[:4] or 0))))
    done = 0
    for i in range(0, min(len(todo), budget), 25):
        if time_left() < 15 * 60:
            break
        chunk = todo[i:i + 25]
        try:
            tr = fn.translate_batch([p["t"] for p in chunk], sl="auto")
            for p, t in zip(chunk, tr):
                p["tj"] = t
            done += len(chunk)
            time.sleep(0.5)
        except Exception as e:
            log(f"project translate failed: {e}")
            time.sleep(3)
    log(f"projects translated {done}, {len(todo) - done} left")



# ---------------------------------------------------------------- JICA project database
# IATI carries only a handful of JICA activities, so the full history (technical
# cooperation, grant aid, loans, volunteers ...) comes from JICA's public project
# search ("ODA見える化サイト"): the Kyrgyz result list, then each project page.
JICA_LIST = "https://www2.jica.go.jp/ja/oda/index.php?"
JICA_PAGE = "https://www.jica.go.jp/oda/project/{}/index.html"
JICA_SCHEMES = ["技術協力プロジェクト", "無償資金協力", "有償資金協力", "円借款", "草の根技術協力", "海外協力隊",
                "開発計画調査型技術協力", "開発調査", "科学技術協力", "SATREPS", "個別専門家", "専門家派遣",
                "課題別研修", "国別研修", "研修", "民間連携", "中小企業", "技術協力", "ボランティア", "協力準備調査"]
JICA_PV = 5  # parser version: pages read by an older parser are fetched again
JP_DATE = re.compile(r"(\d{4})\s*[年./／-]\s*(\d{1,2})(?:\s*[月./／-]\s*(\d{1,2})\s*日?)?")
YEN = re.compile(r"([\d,]+(?:\.\d+)?)\s*(億円|百万円|千円|万円|円)")


def page_text(html_):
    t = re.sub(r"(?is)<(script|style|noscript).*?</\1>", " ", html_)
    t = re.sub(r"(?i)<br\s*/?>|</(p|div|li|tr|dt|dd|th|td|h\d)>", "\n", t)
    t = fn.html.unescape(re.sub(r"<[^>]+>", " ", t))
    return "\n".join(re.sub(r"[ \t　]+", " ", ln).strip() for ln in t.splitlines() if ln.strip())


def label_pairs(html_):
    """<th>label</th><td>value</td> and <dt>label</dt><dd>value</dd> pairs."""
    out = {}
    for m in re.finditer(r"(?is)<(th|dt)[^>]*>(.*?)</\1>\s*<(td|dd)[^>]*>(.*?)</\3>", html_):
        k, v = clean(m.group(2)), clean(m.group(4))
        if k and v and k not in out:
            out[k] = v
    return out


def pick(pairs, *words):
    for k, v in pairs.items():
        if any(w in k for w in words):
            return v
    return ""


def jp_dates(text):
    ds = []
    for y, m, d in JP_DATE.findall(text or ""):
        y, m = int(y), int(m)
        if 1950 < y < 2100 and 1 <= m <= 12:
            ds.append(f"{y}-{m:02d}-{int(d or 1):02d}")
    return ds


def yen_amount(text):
    best = None
    for num_, unit in YEN.findall(text or ""):
        v = float(num_.replace(",", "")) * {"億円": 1e8, "百万円": 1e6, "千円": 1e3, "万円": 1e4, "円": 1}[unit]
        best = max(best or 0, v)
    return best


def jica_projects(out_dir, prev_projs):
    dbg = os.path.join(out_dir, "debug")
    os.makedirs(dbg, exist_ok=True)
    listed, order = {}, []
    for page in range(1, 80):
        url = JICA_LIST + urllib.parse.urlencode({"area1": "アジア", "country1": "キルギス", "search": "検索", "p": page})
        html_ = get(url, timeout=60).decode("utf-8", "replace")
        if page == 1:
            open(os.path.join(dbg, "jica-list-1.html"), "w").write(html_)
        links = list(re.finditer(r"(?:https?://www\.jica\.go\.jp)?/oda/project/([0-9A-Za-z_-]+)/index\.html", html_))
        new = 0
        for i, m in enumerate(links):
            pid = m.group(1)
            seg = html_[m.start(): links[i + 1].start() if i + 1 < len(links) else m.start() + 3000]
            if pid not in listed:
                a = re.search(r">([^<]{4,200})</a>", seg)
                listed[pid] = {"title": clean(a.group(1)) if a else "", "row": page_text(seg)[:600]}
                order.append(pid)
                new += 1
        log(f"jica list p{page}: {len(links)} links, {new} new")
        if not new:
            break
        time.sleep(0.6)
    prev_by = {p["id"]: p for p in prev_projs if p.get("src") == "jica"}
    today = NOW.date().isoformat()
    out, fetched, nodbg = [], 0, 0
    for pid in order:
        old = prev_by.get("JICA-" + pid)
        # project pages change little: refresh new ones, and running ones once a week
        stale = not old or old.get("pv") != JICA_PV or (old.get("st") in ("active", "pipeline") and old.get("fetched", "") < (NOW - timedelta(days=7)).date().isoformat())
        if not stale or fetched >= 220 or time_left() < 20 * 60:
            if old:
                out.append(old)
                continue
            if fetched >= 220 or time_left() < 20 * 60:
                info = listed[pid]
                out.append(jica_record(pid, info["title"], {}, info["row"], today, fetched=""))
                continue
        try:
            html_ = get(JICA_PAGE.format(pid), timeout=40).decode("utf-8", "replace")
            fetched += 1
            if fetched <= 3:
                open(os.path.join(dbg, f"jica-project-{pid}.html"), "w").write(html_)
            h1 = re.search(r"(?is)<h1[^>]*>(.*?)</h1>", html_)
            title = clean(h1.group(1)) if h1 else ""
            if not title or len(title) < 4 or "JICA" == title:
                tt = re.search(r"(?is)<title>(.*?)</title>", html_)
                title = re.split(r"\s*[|｜]\s*", clean(tt.group(1)))[0] if tt else ""
            rec = jica_record(pid, title or listed[pid]["title"], label_pairs(html_), page_text(html_), today)
            out.append(rec)
            # keep loan pages whose amount wasn't found (technical cooperation pages publish none), to check the parsing
            if not rec.get("jpy") and rec.get("kind") != "技術協力" and nodbg < 4:
                nodbg += 1
                open(os.path.join(dbg, f"jica-noamount-{pid}.html"), "w").write(html_)
            time.sleep(0.4)
        except Exception as e:
            log(f"jica {pid}: {e}")
            out.append(old or jica_record(pid, listed[pid]["title"], {}, listed[pid]["row"], today, fetched=""))
    log(f"jica: {len(order)} listed, {fetched} pages fetched")
    return out


def jica_record(pid, title, pairs, text, today, fetched=None):
    raw = pairs.get("事業") or pick(pairs, "スキーム", "事業形態", "協力形態", "案件種別", "援助形態")
    # "無償資金協力（贈与契約（G/A））" -> "無償資金協力"; without the field, look before the description
    scheme = next((w for w in JICA_SCHEMES if w in raw), raw) if raw else \
        next((w for w in JICA_SCHEMES if w in text.split("プロジェクト紹介")[0]), "")
    period = pick(pairs, "協力期間", "事業期間", "実施期間", "派遣期間", "協力年度", "期間", "期限", "締結", "調印", "L/A", "G/A")
    # only fall back to the page text before the project description, which quotes unrelated dates
    head = text.split("プロジェクト紹介")[0][:4000]
    ds = jp_dates(period) or jp_dates(head)
    start = min(ds) if ds else None
    end = max(ds) if len(ds) > 1 else None
    field = pick(pairs, "分野課題", "課題", "分野")
    amt = yen_amount(pick(pairs, "金額", "限度額", "協力額", "承諾額", "供与額", "協力費", "契約額"))
    status_txt = pick(pairs, "状況", "ステータス", "進捗")
    m = re.search(r"(実施中|終了)案件", head)
    if m:
        status_txt += m.group(0)
    if end and end < today:
        st = "closed"
    elif start and start > today:
        st = "pipeline"
    elif "終了" in status_txt:
        st = "closed"
    elif "実施中" in status_txt:
        st = "active"
    elif start and start > (NOW - timedelta(days=5 * 365)).date().isoformat():
        st = "active"
    else:
        st = "closed"  # no end date and started long ago
    summary = pick(pairs, "概要", "目標", "上位目標", "プロジェクト目標")
    rec = {"id": "JICA-" + pid, "src": "jica", "donor": "jica", "org": "JICA", "t": title, "tj": title,
           "x": fn.first_sentences(" ".join(filter(None, [field, summary])), 220), "st": st, "a": start, "e": end,
           "kind": scheme, "sch": scheme_of("jica", scheme), "cur": "JPY" if amt else None, "jpy": amt, "amt": round(amt / 140) if amt else None,
           "u": JICA_PAGE.format(pid), "_sect": field, "fetched": today if fetched is None else fetched, "pv": JICA_PV}
    return rec


DEBUG_DIR = "."


def collect_projects(out_dir):
    global DEBUG_DIR
    DEBUG_DIR = os.path.join(out_dir, "debug")
    os.makedirs(DEBUG_DIR, exist_ok=True)
    prev = None
    try:
        prev = json.loads(get(BASE + "projects.json"))
    except Exception as e:
        log(f"no previous projects: {e}")
    # refresh daily, and at once when the JICA parser has changed since the last crawl
    fresh = prev and prev.get("updated") and "jica" in (prev.get("sources") or {}) and \
        NOW - datetime.fromisoformat(prev["updated"]) < timedelta(hours=20) and \
        all(p.get("pv") == JICA_PV for p in prev.get("projects", []) if p.get("src") == "jica")
    if fresh and not os.environ.get("FORCE_PROJECTS"):
        log("projects: still fresh, keeping (translating any left)")
        translate_projects(prev.get("projects", []))
        result = prev
    else:
        projs, sources = [], {}
        prev_projs = (prev or {}).get("projects", [])
        for key, fn_ in (("wb", wb_projects), ("iati", iati_projects),
                         ("jica", lambda: jica_projects(out_dir, prev_projs))):
            try:
                got = fn_()
                projs += got
                sources[key] = {"ok": True, "count": len(got)}
            except Exception as e:
                log(f"projects {key}: failed: {e}")
                kept = [p for p in prev_projs if p.get("src") == key]
                projs += kept
                sources[key] = {"ok": False, "count": len(kept), "error": str(e)[:200]}
        # JICA's own database supersedes the few JICA activities in IATI
        if sum(1 for p in projs if p.get("src") == "jica") >= 10:
            projs = [p for p in projs if not (p.get("src") == "iati" and p.get("donor") == "jica")]
        if not projs and prev:
            result = prev
        else:
            result = {"updated": NOW.isoformat(), "sources": sources, "projects": finish_projects(projs, prev)}
    if AI:
        try:
            AI.projects(result.get("projects", []), int(os.environ.get("AI_PROJECT_BUDGET", 800)), time_left)
        except Exception as e:
            log(f"ai projects: failed: {e}")
    with open(os.path.join(out_dir, "projects.json"), "w") as fh:
        json.dump(result, fh, ensure_ascii=False, separators=(",", ":"))
    return result


# ---------------------------------------------------------------- main

def stats(store, projects):
    cutoff30 = (NOW - timedelta(days=30)).isoformat()
    cutoff7 = (NOW - timedelta(days=7)).isoformat()
    s = {sid: {"n30": 0, "n7": 0, "gov30": 0, "donor30": 0, "all": 0, "pa": 0, "pt": 0} for sid in SECTOR_IDS}
    for x in store.values():
        if x.get("hide"):
            continue
        for c in x.get("c", []):
            if c not in s:
                continue
            s[c]["all"] += 1
            if x["p"] >= cutoff30:
                s[c]["n30"] += 1
                s[c]["gov30"] += x.get("g", 0)
                s[c]["donor30"] += 1 if x.get("d") else 0
            if x["p"] >= cutoff7:
                s[c]["n7"] += 1
    for p in projects or []:
        for c in p.get("c", []):
            if c in s:
                s[c]["pt"] += 1
                s[c]["pa"] += 1 if p.get("st") == "active" else 0
    return s


BUDGET_PROBES = [  # candidate sources for government spending by sector / ministry; saved to look at their format
    ("stat-opendata-38-en", "https://stat.gov.kg/en/opendata/category/38/"),
    ("stat-opendata-38-ru", "https://stat.gov.kg/ru/opendata/category/38/"),
    ("okmot-budget", "https://budget.okmot.kg/"),
    ("okmot-budget-ru", "https://budget.okmot.kg/ru/"),
    ("okmot-old-instructions", "https://oldbudget.okmot.kg/en/instructions/index.html"),
    ("minfin-home", "https://www.minfin.kg/"),
    ("wdi-education", "https://api.worldbank.org/v2/country/KGZ/indicator/SE.XPD.TOTL.GD.ZS?format=json&per_page=60"),
    ("wdi-health", "https://api.worldbank.org/v2/country/KGZ/indicator/SH.XPD.GHED.GD.ZS?format=json&per_page=60"),
    ("wdi-gdp-usd", "https://api.worldbank.org/v2/country/KGZ/indicator/NY.GDP.MKTP.CD?format=json&per_page=60"),
]


def probe_budget_sources(out_dir):
    dbg = os.path.join(out_dir, "debug")
    os.makedirs(dbg, exist_ok=True)
    for name, url in BUDGET_PROBES:
        try:
            raw = get(url, timeout=40)
            open(os.path.join(dbg, f"budget-{name}.txt"), "wb").write(raw[:400000])
            log(f"budget probe {name}: {len(raw)} bytes")
        except Exception as e:
            open(os.path.join(dbg, f"budget-{name}.txt"), "w").write(f"ERROR {e}")
            log(f"budget probe {name}: {e}")


def fx_rates():
    """US dollar in yen and som, for the page's currency switch."""
    try:
        d = json.loads(get("https://open.er-api.com/v6/latest/USD", timeout=30))
        r = d.get("rates") or {}
        if r.get("JPY") and r.get("KGS"):
            return {"JPY": round(r["JPY"], 2), "KGS": round(r["KGS"], 2),
                    "date": datetime.fromtimestamp(d.get("time_last_update_unix", time.time()), timezone.utc).strftime("%Y-%m-%d")}
    except Exception as e:
        log(f"fx: {e}")
    return None


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out_dir, exist_ok=True)
    fn.use_country("kg")
    store, meta = load_prev()

    new = collect(archive_empty=not store)
    log(f"live: {len(new)} items, {merge(store, new)} new")

    cursor = int(meta.get("backfill_cursor") or 0)
    if time_left() > 45 * 60 and cursor < BACKFILL_MONTHS * 2:
        month, qs = backfill_queries(cursor)
        got = run_gnews(qs)
        log(f"backfill {month:%Y-%m}: {len(got)} items, {merge(store, got)} new")
        cursor += 1
    reclassify(store)
    group_duplicates(store)

    # keep a few years
    oldest = f"{NOW.year - KEEP_YEARS + 1}-01-01"
    for k in [k for k, x in store.items() if x["p"] < oldest]:
        del store[k]

    resolve_links(store, int(os.environ.get("RESOLVE_BUDGET", 900)))
    global AI
    if AI_ON:
        try:
            AI = ai_classify.Classifier([(sid, ja) for sid, ja, *_ in SECTORS], [(d, ja) for d, ja, _, _ in DONORS])
            AI.items(store, int(os.environ.get("AI_ITEM_BUDGET", 800)), time_left)
        except Exception as e:
            log(f"ai items: failed: {e}")
    else:
        log("ai: no ANTHROPIC_API_KEY, keyword classification only")
    translate_store(store, int(os.environ.get("TR_BUDGET", 900)))  # Japanese for anything the AI didn't title

    try:
        projects = collect_projects(out_dir).get("projects", [])
    except Exception as e:
        log(f"projects failed: {e}")
        projects = []

    probe_budget_sources(out_dir)

    years = {}
    for x in store.values():
        years.setdefault(x["p"][:4], []).append(x)
    for y, xs in years.items():
        xs.sort(key=lambda x: x["p"], reverse=True)
        with open(os.path.join(out_dir, f"items-{y}.json"), "w") as fh:
            json.dump({"year": y, "items": xs}, fh, ensure_ascii=False, separators=(",", ":"))
    index = {
        "version": 1, "updated": NOW.isoformat(), "years": sorted(years, reverse=True),
        "counts": {y: len(xs) for y, xs in years.items()}, "total": len(store),
        "stats": stats(store, projects),
        "sectors": [{"id": sid, "ja": ja} for sid, ja, *_ in SECTORS],
        "donors": [{"id": did, "ja": ja, "g": grp} for did, ja, grp, _ in DONORS],
        "backfill_cursor": cursor, "backfill_months": BACKFILL_MONTHS, "fx": fx_rates(),
        "untranslated": sum(1 for x in store.values() if "tj" not in x),
        "ai": {"model": ai_classify.MODEL, "version": ai_classify.AI_VERSION,
               "items_done": sum(1 for x in store.values() if x.get("ai") == ai_classify.AI_VERSION),
               "hidden": sum(1 for x in store.values() if x.get("hide")),
               "usage": AI.usage if AI else None} if AI_ON else None,
    }
    with open(os.path.join(out_dir, "index.json"), "w") as fh:
        json.dump(index, fh, ensure_ascii=False, separators=(",", ":"))
    log(f"done: {len(store)} items in {len(years)} years, {len(projects)} projects, {int(time.time() - START)}s")
    if not store:
        sys.exit("nothing collected")


if __name__ == "__main__":
    main()
