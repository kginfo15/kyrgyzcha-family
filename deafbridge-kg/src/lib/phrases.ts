import type { ConvLang } from "./types";

export type PhraseIconName =
  | "ear-off" | "phone-text" | "repeat" | "mic" | "hourglass" | "check" | "cross" | "heart" | "smile"
  | "pill" | "pen" | "doc" | "bandage" | "thermo" | "coins" | "card" | "cash"
  | "door" | "person" | "come" | "window" | "alert" | "lips" | "facing";

/**
 * 定型返答文。
 *
 * - ru: ロシア語 / ky: キルギス語 / ja: 日本語の意味（開発者・支援者向け）
 * - キルギス語は draft です。実地テストの前に必ずネイティブ話者の確認を受けてください
 *   （README「未解決課題」参照）。
 * - id は事前生成音声のファイル名（public/audio/{lang}/{id}.mp3）にも使います。変更しないこと。
 */
export type PhraseCategory = "basic" | "pharmacy" | "door";

export type Phrase = {
  id: string;
  category: PhraseCategory;
  ru: string;
  ky: string;
  ja: string;
  /** 文字が苦手な人にも分かるよう、ボタンに出すアイコン（components/icons.tsx） */
  icon: PhraseIconName;
  /** 目立たせたい重要な返答 */
  primary?: boolean;
};

export const PHRASE_CATEGORIES: PhraseCategory[] = ["basic", "pharmacy", "door"];

export const PHRASES: Phrase[] = [
  // ---- 基本 ----
  {
    id: "deaf", icon: "ear-off",
    category: "basic",
    ru: "Я не слышу. Напишите, пожалуйста.",
    ky: "Мен уга албайм. Сураныч, жазып бериңиз.",
    ja: "耳が聞こえません。文字で書いてください。",
    primary: true,
  },
  {
    id: "app_info", icon: "phone-text",
    category: "basic",
    ru: "Я плохо слышу. Телефон переводит вашу речь в текст. Говорите, пожалуйста, медленно и чётко.",
    ky: "Мен начар угам. Телефон сиздин сөзүңүздү текстке айлантат. Сураныч, жай жана так сүйлөңүз.",
    ja: "耳が不自由です。スマホがあなたの声を文字にします。ゆっくり、はっきり話してください。",
    primary: true,
  },
  {
    id: "repeat", icon: "repeat",
    category: "basic",
    ru: "Повторите, пожалуйста.",
    ky: "Сураныч, кайталап коюңузчу.",
    ja: "もう一度お願いします。",
    primary: true,
  },
  {
    id: "counter_intro", icon: "facing",
    category: "basic",
    ru: "Я не слышу. Говорите, пожалуйста, в сторону телефона — ваши слова появятся текстом.",
    ky: "Мен укпайм. Сураныч, телефонду карап сүйлөңүз — сөзүңүз текст болуп чыгат.",
    ja: "耳が聞こえません。スマホに向かって話してください。言葉が文字になります。",
  },
  {
    id: "toward_phone", icon: "phone-text",
    category: "basic",
    ru: "Говорите, пожалуйста, в сторону телефона.",
    ky: "Сураныч, телефонду карап сүйлөңүз.",
    ja: "スマホに向かって話してください。",
  },
  {
    id: "type_here", icon: "pen",
    category: "basic",
    ru: "Напишите, пожалуйста, здесь.",
    ky: "Сураныч, ушул жерге жазыңыз.",
    ja: "ここに書いてください。",
  },
  {
    id: "lipread", icon: "lips",
    category: "basic",
    ru: "Я читаю по губам. Говорите, пожалуйста, медленно, глядя на меня.",
    ky: "Мен эриндин кыймылынан окуйм. Сураныч, мени карап, жай сүйлөңүз.",
    ja: "口の動きを読みます。こちらを見て、ゆっくり話してください。",
  },
  {
    id: "closer", icon: "mic",
    category: "basic",
    ru: "Говорите, пожалуйста, ближе к микрофону.",
    ky: "Сураныч, микрофонго жакыныраак сүйлөңүз.",
    ja: "マイクに近づいて話してください。",
  },
  {
    id: "wait", icon: "hourglass",
    category: "basic",
    ru: "Подождите, пожалуйста.",
    ky: "Сураныч, күтө туруңуз.",
    ja: "少し待ってください。",
  },
  { id: "yes", icon: "check", category: "basic", ru: "Да.", ky: "Ооба.", ja: "はい。" },
  { id: "no", icon: "cross", category: "basic", ru: "Нет.", ky: "Жок.", ja: "いいえ。" },
  { id: "thanks", icon: "heart", category: "basic", ru: "Спасибо.", ky: "Рахмат.", ja: "ありがとうございます。" },
  { id: "hello", icon: "smile", category: "basic", ru: "Здравствуйте.", ky: "Саламатсызбы.", ja: "こんにちは。" },

  // ---- 薬局 ----
  {
    id: "buy_medicine", icon: "pill",
    category: "pharmacy",
    ru: "Я хочу купить лекарство.",
    ky: "Мен дары сатып алгым келет.",
    ja: "薬を買いたいです。",
    primary: true,
  },
  {
    id: "show_name", icon: "pen",
    category: "pharmacy",
    ru: "Я покажу название лекарства на экране.",
    ky: "Дарынын атын экрандан көрсөтөм.",
    ja: "薬の名前を画面で見せます。",
  },
  {
    id: "prescription", icon: "doc",
    category: "pharmacy",
    ru: "У меня есть рецепт.",
    ky: "Менде рецепт бар.",
    ja: "処方箋があります。",
  },
  {
    id: "painkiller", icon: "bandage",
    category: "pharmacy",
    ru: "Мне нужно обезболивающее.",
    ky: "Мага ооруну басуучу дары керек.",
    ja: "痛み止めが必要です。",
  },
  {
    id: "fever", icon: "thermo",
    category: "pharmacy",
    ru: "Мне нужно лекарство от температуры.",
    ky: "Мага температурага каршы дары керек.",
    ja: "熱の薬が必要です。",
  },
  {
    id: "price", icon: "coins",
    category: "pharmacy",
    ru: "Сколько это стоит?",
    ky: "Бул канча турат?",
    ja: "いくらですか？",
  },
  {
    id: "card", icon: "card",
    category: "pharmacy",
    ru: "Можно оплатить картой?",
    ky: "Карта менен төлөсөм болобу?",
    ja: "カードで払えますか？",
  },
  {
    id: "cash", icon: "cash",
    category: "pharmacy",
    ru: "Я заплачу наличными.",
    ky: "Накталай акча менен төлөйм.",
    ja: "現金で払います。",
  },

  // ---- 玄関・インターフォン ----
  {
    id: "open_door", icon: "door",
    category: "door",
    ru: "Откройте, пожалуйста, дверь.",
    ky: "Сураныч, эшикти ачыңызчы.",
    ja: "ドアを開けてください。",
    primary: true,
  },
  {
    id: "at_door", icon: "person",
    category: "door",
    ru: "Я стою у двери.",
    ky: "Мен эшиктин алдында турам.",
    ja: "ドアの前にいます。",
  },
  {
    id: "come_out", icon: "come",
    category: "door",
    ru: "Подойдите, пожалуйста, к двери.",
    ky: "Сураныч, эшикке чыгып коюңузчу.",
    ja: "ドアのところまで来てください。",
  },
  {
    id: "window", icon: "window",
    category: "door",
    ru: "Покажите, пожалуйста, в окошке.",
    ky: "Сураныч, терезеден көрсөтүңүзчү.",
    ja: "窓口で見せてください。",
  },
  {
    id: "urgent", icon: "alert",
    category: "door",
    ru: "Это срочно. Мне нужна помощь.",
    ky: "Бул шашылыш. Мага жардам керек.",
    ja: "急いでいます。助けが必要です。",
  },
];

export function phraseText(p: Phrase, lang: ConvLang | "ja"): string {
  return lang === "ru" ? p.ru : lang === "ky" ? p.ky : p.ja;
}

export function findPhrase(id: string): Phrase | undefined {
  return PHRASES.find((p) => p.id === id);
}
