"""Pillars, indicators and targets per sector for the indicator charts (read by build_indicators.py).

Each indicator:
  ref / ref2  where the series comes from: ("wb", code) | ("sdg", code, {dims}) | ("who", code, "dimkey")
  sn / s2n    names of the two lines when there are two (e.g. 全国 / 農村)
  dir         "up" or "down": which way is better
  t           targets: k "nat" = national (国家目標), "sdg" = SDG or other international target;
              judge False = draw it but do not use it for ✓△✕
  from, drop  first year shown, years left out; flip = show (flip - value); scale, nd = multiply, decimals
  status, st  set by hand to override the automatic ✓△✕
Each pillar: id, name, tag, node ("strategy:node" on the strategy tree), note,
  goals = national targets without a yearly public figure [[text, why]].
"""

UPDATED = "2026-11-07"

WB, SDG = "世界銀行 WDI", "国連SDGデータベース"

SPEC = {
# ---------------------------------------------------------------- 19 水資源・水供給
"water": {
  "srcs": "世界銀行 WDI / 国連SDGデータベース（元はWHO・UNICEF共同監視計画、FAO AQUASTAT、UNEP）/ 飲料水供給・排水システム発展プログラム / 国家開発プログラム2030",
  "s2label": "2本目の線（農村など、各グラフに説明）",
  "pillars": [
    {"id": "dw", "name": "① 飲料水", "tag": "安全に管理された水を使える人", "node": "water:water", "inds": [
      {"name": "安全に管理された飲料水を使える人の割合", "unit": "%", "dir": "up", "sn": "全国", "s2n": "農村",
       "ref": ("wb", "SH.H2O.SMDW.ZS"), "ref2": ("wb", "SH.H2O.SMDW.RU.ZS"),
       "t": [{"k": "sdg", "v": 100, "y": 2030, "l": "SDG 全員", "lt": "SDG 6.1 全員が安全な水を"}],
       "src": "青:全国/橙:農村(世界銀行 WDI SH.H2O.SMDW、元はWHO・UNICEF JMP)",
       "note": "2021年をピークに下がっている。都市は81%、農村は69%で、差が大きい。"},
      {"name": "少なくとも基本的な飲料水を使える人の割合", "unit": "%", "dir": "up", "ymax": 100,
       "ref": ("wb", "SH.H2O.BASW.ZS"),
       "t": [{"k": "sdg", "v": 100, "y": 2030, "l": "SDG 全員", "lt": "SDG 6.1 全員"}], "src": "世界銀行 WDI SH.H2O.BASW.ZS(元はJMP)"},
    ]},
    {"id": "san", "name": "② 衛生・手洗い", "tag": "トイレと手洗いの設備", "node": "water:W1", "inds": [
      {"name": "安全に管理された衛生施設を使える人の割合", "unit": "%", "dir": "up", "ymax": 100,
       "ref": ("wb", "SH.STA.SMSS.ZS"),
       "t": [{"k": "sdg", "v": 100, "y": 2030, "l": "SDG 全員", "lt": "SDG 6.2 全員が安全な衛生施設を"}], "src": "世界銀行 WDI SH.STA.SMSS.ZS(元はJMP)",
       "note": "農村の多くは汲み取り式の屋外トイレだが、国際的な定義では「安全に管理」に数えられる。下水道につながる人の割合はずっと低い。"},
      {"name": "石けんと水で手を洗える設備がある人の割合", "unit": "%", "dir": "up", "ymax": 100,
       "ref": ("wb", "SH.STA.HYGN.ZS"),
       "t": [{"k": "sdg", "v": 100, "y": 2030, "l": "SDG 全員", "lt": "SDG 6.2 全員"}], "src": "世界銀行 WDI SH.STA.HYGN.ZS(元はJMP)"},
    ]},
    {"id": "iwrm", "name": "③ 水資源の管理", "tag": "流域管理・水の使い方の効率", "node": "water:nws",
     "goals": [["送水中の水の損失を15%まで減らす(国家開発プログラム2030 5.3)", "毎年の損失率を公開した統計が見つかっていない"]],
     "inds": [
      {"name": "統合水資源管理(IWRM)の実施度", "unit": "点(100点満点)", "dir": "up", "ymin": 0, "ymax": 100,
       "ref": ("sdg", "ER_H2O_IWRMD"),
       "t": [{"k": "sdg", "v": 100, "y": 2030, "l": "SDG 100点", "lt": "SDG 6.5.1 100点(完全実施)"}],
       "src": "国連SDGデータベース ER_H2O_IWRMD(元はUNEP、3年ごとの調査)", "status": "warn", "st": "△ 2020年31点→2023年38点。100点には遠い"},
      {"name": "水ストレス(使える水のうち取水している割合)", "unit": "%", "dir": "down",
       "ref": ("sdg", "ER_H2O_STRESS", {"Activity": "TOTAL"}),
       "t": [{"k": "sdg", "v": 25, "y": 2030, "l": "FAO 25%", "lt": "FAO目安 25%未満(ストレスなし)", "judge": False}],
       "src": "国連SDGデータベース ER_H2O_STRESS(元はFAO AQUASTAT)", "status": "warn", "st": "△ 約50%で「水ストレスあり」の水準",
       "note": "取水の9割以上が農業(灌漑)。25%を超えると水ストレスがあるとされる。"},
      {"name": "水の使い方の効率(水1m³あたりの経済価値)", "unit": "ドル/m³", "dir": "up", "nd": 2,
       "ref": ("sdg", "ER_H2O_WUEYST", {"Activity": "TOTAL"}),
       "src": "国連SDGデータベース ER_H2O_WUEYST(SDG 6.4.1、元はFAO)",
       "note": "SDG 6.4 は「大幅に改善」とだけ定め、数値目標はない。農業だけだと 0.11ドル/m³ と特に低い。"},
    ]},
  ]},
# ---------------------------------------------------------------- 20 防災
"drr": {
  "srcs": "国連SDGデータベース(仙台防災枠組モニター、元は緊急事態省の報告) / 国家開発プログラム2030 13.1 / 緊急事態リスク低減の行動計画 2025–2030",
  "pillars": [
    {"id": "plan", "name": "① 防災の計画と体制", "tag": "国と地方の防災戦略", "node": "drrplan:R5",
     "goals": [["自然災害の国の早期警報システムを作る(国家開発プログラム2030 13.1)", "整備の進み具合を数字で示す公開データがない"]],
     "inds": [
      {"name": "防災戦略をもち実施している地方自治体の割合", "unit": "%", "dir": "up", "ymin": 0, "ymax": 100,
       "ref": ("sdg", "SG_DSR_SILS"),
       "t": [{"k": "nat", "v": 100, "y": 2030, "l": "国家 100%", "lt": "全自治体(国家開発プログラム2030 13.1)"}],
       "src": "国連SDGデータベース SG_DSR_SILS(SDG 1.5.4/11.b.2)"},
      {"name": "国の防災戦略の仙台防災枠組への適合度", "unit": "点(1点満点)", "dir": "up", "ymin": 0, "ymax": 1, "nd": 2,
       "ref": ("sdg", "SG_DSR_LGRGSR"),
       "t": [{"k": "sdg", "v": 1, "y": 2030, "l": "仙台 1.0", "lt": "仙台防災枠組 1.0(完全適合)"}],
       "src": "国連SDGデータベース SG_DSR_LGRGSR(SDG 1.5.3/11.b.1)", "status": "good", "st": "✓ 0.93点と高い"},
    ]},
    {"id": "loss", "name": "② 災害の被害", "tag": "亡くなる人・被災する人・経済損失", "node": "drrplan:R2",
     "inds": [
      {"name": "災害で亡くなった人・行方不明者(10万人あたり)", "unit": "人", "dir": "down", "nd": 2, "drop": [2020],
       "ref": ("sdg", "VC_DSR_MTMP"),
       "t": [{"k": "sdg", "v": 2.0, "y": 2030, "l": "仙台 目安", "lt": "仙台防災枠組 2005–15年の平均(2.0人)より下げる", "judge": False}],
       "src": "国連SDGデータベース VC_DSR_MTMP(SDG 1.5.1/11.5.1)", "status": "good", "st": "✓ 多くの年で2005–15年の平均(約2.0)を下回る",
       "note": "2020年(59人)は新型コロナの死者が含まれるため、グラフから外した。年ごとの差が大きく、大きな土石流や地震の年に跳ね上がる。"},
      {"name": "災害の直接の経済損失", "unit": "百万ドル", "dir": "down",
       "ref": ("sdg", "VC_DSR_GDPLS"),
       "t": [{"k": "sdg", "v": 21.2, "y": 2030, "l": "仙台 目安", "lt": "仙台防災枠組 2005–15年の平均(2,120万ドル)より下げる", "judge": False}],
       "src": "国連SDGデータベース VC_DSR_GDPLS(SDG 1.5.2/11.5.2)", "status": "warn", "st": "△ 2021・2022年は平均を上回った"},
    ]},
    {"id": "tech", "name": "③ 技術災害・負の遺産", "tag": "ウラン鉱滓・ダム", "node": "drrplan:R3", "inds": [],
     "goals": [["旧ウラン鉱滓池・ぼた山16か所を安全な状態にする(国家開発プログラム2030 13.1)", "工事の進み具合は緊急事態省の報告やドナー(EU・ロシアなど)の事業報告にしか出ていない。年1回手で拾う予定"]]},
  ]},
# ---------------------------------------------------------------- 03 資源・エネルギー
"energy": {
  "srcs": "世界銀行 WDI(元はIEA・国連統計) / 国連SDGデータベース / 国家開発プログラム2030 5.4 / 省エネ・エネルギー効率政策プログラム 2023–2027",
  "pillars": [
    {"id": "re", "name": "① 再生可能エネルギー", "tag": "水力・太陽光・風力", "node": "eneff:F5",
     "goals": [["再エネで年75億kWhを発電する(国家開発プログラム2030 5.4)", "国の統計の発電量は年報で出るが、APIでは取れない"],
               ["予備の発電能力を550〜700MW確保する(同)", "公開データなし"]],
     "inds": [
      {"name": "発電に占める再生可能エネルギー(水力など)の割合", "unit": "%", "dir": "up", "flip": 100,
       "ref": ("wb", "EG.ELC.FOSL.ZS"),
       "t": [{"k": "nat", "v": 92, "y": 2030, "l": "国家 92%", "lt": "再エネ発電 92%(国家開発プログラム2030 5.4)"}],
       "src": "世界銀行 WDI EG.ELC.FOSL.ZS(化石燃料の割合を100から引いた値。元はIEA・Ember)",
       "note": "ほぼ全部が水力。渇水の年や石炭火力(ビシュケク熱電併給所)を多く動かした年に下がる。"},
      {"name": "最終エネルギー消費に占める再エネの割合", "unit": "%", "dir": "up",
       "ref": ("sdg", "EG_FEC_RNEW"), "src": "国連SDGデータベース EG_FEC_RNEW(SDG 7.2.1)",
       "note": "暖房や車の燃料も含めた割合。電気以外は石炭・ガス・ガソリンが中心なので、発電の割合よりずっと低い。"},
    ]},
    {"id": "grid", "name": "② 送電・配電", "tag": "電力の損失", "node": "eneff:F2", "inds": [
      {"name": "送電・配電で失われる電力の割合", "unit": "%", "dir": "down",
       "ref": ("wb", "EG.ELC.LOSS.ZS"),
       "t": [{"k": "nat", "v": 10, "y": 2030, "l": "国家 10%", "lt": "損失 10%(国家開発プログラム2030 5.4)"}],
       "src": "世界銀行 WDI EG.ELC.LOSS.ZS(元はIEA)",
       "note": "盗電や古い配電網による損失を含む。省エネプログラムの本文では低圧配電の損失は 2021年に11.9%。"},
    ]},
    {"id": "eff", "name": "③ 省エネ・暮らしのエネルギー", "tag": "エネルギーの効率・ガス化・調理の燃料", "node": "eneff:F3",
     "goals": [["集落のガス化率を60%に(2030年、省エネプログラム。2020年は35%)", "毎年のガス化率はガスプロム・キルギスの発表のみ"]],
     "inds": [
      {"name": "エネルギー強度(GDP 1ドルを生むのに使うエネルギー)", "unit": "MJ/ドル(購買力平価)", "dir": "down", "nd": 2,
       "ref": ("sdg", "EG_EGY_PRIM"),
       "t": [{"k": "sdg", "v": 3.31, "y": 2030, "l": "SDG 目安", "lt": "SDG 7.3 年2.6%ずつ改善(3.31)"}],
       "src": "国連SDGデータベース EG_EGY_PRIM(SDG 7.3.1)",
       "note": "SDG 7.3 の「改善のペースを倍に」(年2.6%)を2015年の値に当てはめた目安。省エネプログラムは「世界平均に近づける」で数値はない。"},
      {"name": "清潔な燃料・調理器具を使える人の割合", "unit": "%", "dir": "up", "ymax": 100,
       "ref": ("wb", "EG.CFT.ACCS.ZS"),
       "t": [{"k": "sdg", "v": 100, "y": 2030, "l": "SDG 全員", "lt": "SDG 7.1.2 全員"}],
       "src": "世界銀行 WDI EG.CFT.ACCS.ZS(元はWHO)",
       "note": "農村では石炭や薪での調理・暖房が残る。電気が来ている人の割合はすでに100%。"},
    ]},
  ]},
}
