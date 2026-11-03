import type { ConvLang } from "./types";

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
  /** 文字が苦手な人にも分かるよう、ボタンに大きく出す絵文字 */
  icon: string;
  /** 目立たせたい重要な返答 */
  primary?: boolean;
};

export const PHRASE_CATEGORIES: PhraseCategory[] = ["basic", "pharmacy", "door"];

export const PHRASES: Phrase[] = [
  // ---- 基本 ----
  {
    id: "deaf", icon: "🧏",
    category: "basic",
    ru: "Я не слышу. Напишите, пожалуйста.",
    ky: "Мен уга албайм. Сураныч, жазып бериңиз.",
    ja: "耳が聞こえません。文字で書いてください。",
    primary: true,
  },
  {
    id: "app_info", icon: "📱",
    category: "basic",
    ru: "Я плохо слышу. Телефон переводит вашу речь в текст. Говорите, пожалуйста, медленно и чётко.",
    ky: "Мен начар угам. Телефон сиздин сөзүңүздү текстке айлантат. Сураныч, жай жана так сүйлөңүз.",
    ja: "耳が不自由です。スマホがあなたの声を文字にします。ゆっくり、はっきり話してください。",
    primary: true,
  },
  {
    id: "repeat", icon: "🔁",
    category: "basic",
    ru: "Повторите, пожалуйста.",
    ky: "Сураныч, кайталап коюңузчу.",
    ja: "もう一度お願いします。",
    primary: true,
  },
  {
    id: "closer", icon: "🎤",
    category: "basic",
    ru: "Говорите, пожалуйста, ближе к микрофону.",
    ky: "Сураныч, микрофонго жакыныраак сүйлөңүз.",
    ja: "マイクに近づいて話してください。",
  },
  {
    id: "wait", icon: "⏳",
    category: "basic",
    ru: "Подождите, пожалуйста.",
    ky: "Сураныч, күтө туруңуз.",
    ja: "少し待ってください。",
  },
  { id: "yes", icon: "✅", category: "basic", ru: "Да.", ky: "Ооба.", ja: "はい。" },
  { id: "no", icon: "❌", category: "basic", ru: "Нет.", ky: "Жок.", ja: "いいえ。" },
  { id: "thanks", icon: "🙏", category: "basic", ru: "Спасибо.", ky: "Рахмат.", ja: "ありがとうございます。" },
  { id: "hello", icon: "👋", category: "basic", ru: "Здравствуйте.", ky: "Саламатсызбы.", ja: "こんにちは。" },

  // ---- 薬局 ----
  {
    id: "buy_medicine", icon: "💊",
    category: "pharmacy",
    ru: "Я хочу купить лекарство.",
    ky: "Мен дары сатып алгым келет.",
    ja: "薬を買いたいです。",
    primary: true,
  },
  {
    id: "show_name", icon: "📝",
    category: "pharmacy",
    ru: "Я покажу название лекарства на экране.",
    ky: "Дарынын атын экрандан көрсөтөм.",
    ja: "薬の名前を画面で見せます。",
  },
  {
    id: "prescription", icon: "📄",
    category: "pharmacy",
    ru: "У меня есть рецепт.",
    ky: "Менде рецепт бар.",
    ja: "処方箋があります。",
  },
  {
    id: "painkiller", icon: "🤕",
    category: "pharmacy",
    ru: "Мне нужно обезболивающее.",
    ky: "Мага ооруну басуучу дары керек.",
    ja: "痛み止めが必要です。",
  },
  {
    id: "fever", icon: "🌡️",
    category: "pharmacy",
    ru: "Мне нужно лекарство от температуры.",
    ky: "Мага температурага каршы дары керек.",
    ja: "熱の薬が必要です。",
  },
  {
    id: "price", icon: "💰",
    category: "pharmacy",
    ru: "Сколько это стоит?",
    ky: "Бул канча турат?",
    ja: "いくらですか？",
  },
  {
    id: "card", icon: "💳",
    category: "pharmacy",
    ru: "Можно оплатить картой?",
    ky: "Карта менен төлөсөм болобу?",
    ja: "カードで払えますか？",
  },
  {
    id: "cash", icon: "💵",
    category: "pharmacy",
    ru: "Я заплачу наличными.",
    ky: "Накталай акча менен төлөйм.",
    ja: "現金で払います。",
  },

  // ---- 玄関・インターフォン ----
  {
    id: "open_door", icon: "🚪",
    category: "door",
    ru: "Откройте, пожалуйста, дверь.",
    ky: "Сураныч, эшикти ачыңызчы.",
    ja: "ドアを開けてください。",
    primary: true,
  },
  {
    id: "at_door", icon: "🧍",
    category: "door",
    ru: "Я стою у двери.",
    ky: "Мен эшиктин алдында турам.",
    ja: "ドアの前にいます。",
  },
  {
    id: "come_out", icon: "🙋",
    category: "door",
    ru: "Подойдите, пожалуйста, к двери.",
    ky: "Сураныч, эшикке чыгып коюңузчу.",
    ja: "ドアのところまで来てください。",
  },
  {
    id: "window", icon: "🪟",
    category: "door",
    ru: "Покажите, пожалуйста, в окошке.",
    ky: "Сураныч, терезеден көрсөтүңүзчү.",
    ja: "窓口で見せてください。",
  },
  {
    id: "urgent", icon: "🚨",
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
