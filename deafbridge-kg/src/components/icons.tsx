import { useId, type ReactNode } from "react";
import type { PhraseIconName } from "@/lib/phrases";

/**
 * DeafBridge のアイコンセット（24×24、線幅をそろえた線画）。
 * 絵文字は端末ごとに見た目が変わり、雰囲気も子どもっぽくなるため、全て自前で描く。
 */
export type UiIconName =
  | "mic"
  | "stop"
  | "chat"
  | "gear"
  | "ear"
  | "speaker"
  | "screen"
  | "close"
  | "trash"
  | "grid"
  | "keyboard"
  | "history"
  | "swap"
  | "bell"
  | "eye"
  | "star"
  | "pin";

export type IconName = UiIconName | PhraseIconName;

const P: Record<IconName, ReactNode> = {
  // ---------- UI ----------
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </>
  ),
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="currentColor" stroke="none" />,
  chat: <path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  ear: <path d="M7.5 9a4.5 4.5 0 1 1 9 0c0 3.2-3.2 4.3-3.2 7.2a3.1 3.1 0 0 1-6.1.8M10 9.3a2 2 0 0 1 4 0" />,
  speaker: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4" />
    </>
  ),
  screen: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M9 20h6M12 16.5V20" />
    </>
  ),
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10.5 11v5M13.5 11v5" />,
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M8 14h8" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5" />
      <path d="M3.5 3.5v5h5M12 7.5V12l3 2" />
    </>
  ),
  swap: <path d="M7 8h12l-3.5-3.5M17 16H5l3.5 3.5" />,
  bell: <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5a2 2 0 0 0 4 0" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />,
  pin: <path d="M9 3.5h6l-1 5.5 3.5 3v2h-11v-2l3.5-3zM12 14v6.5" />,

  // ---------- 定型返答 ----------
  "ear-off": (
    <>
      <path d="M7.5 9a4.5 4.5 0 0 1 8.4-2.3M16.4 10.5c-.6 2.5-3.1 3.6-3.1 5.9a3.1 3.1 0 0 1-6.1.8" />
      <path d="M4 4l16 16" />
    </>
  ),
  "phone-text": (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M9.5 8h5M9.5 11h5M9.5 14h3M11 18.5h2" />
    </>
  ),
  repeat: (
    <>
      <path d="M4.5 11V9.5a3 3 0 0 1 3-3h11l-3-3" />
      <path d="M19.5 13v1.5a3 3 0 0 1-3 3h-11l3 3" />
    </>
  ),
  hourglass: <path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 5 9 5.5 9 8.5s-9 3.5-9 8.5M16.5 3.5c0 5-9 5.5-9 8.5s9 3.5 9 8.5" />,
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.8 12.3l2.8 2.8 5.6-5.8" />
    </>
  ),
  cross: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" />
    </>
  ),
  pill: (
    <>
      <rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)" />
      <path d="M9.5 9.5l5 5" />
    </>
  ),
  pen: <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5zM13.5 7l3 3" />,
  doc: (
    <>
      <path d="M6 3h8.5L19 7.5V21H6z" />
      <path d="M14 3v5h5M12.5 11.5v6M9.5 14.5h6" />
    </>
  ),
  bandage: (
    <>
      <rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-45 12 12)" />
      <path d="M10.6 10.6h.01M13.4 13.4h.01M13.4 10.6h.01M10.6 13.4h.01" />
    </>
  ),
  thermo: (
    <>
      <path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z" />
      <path d="M12 9v7" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="9" cy="7" rx="5.5" ry="2.5" />
      <path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7" />
      <path d="M9.5 16c.9 1 3 1.5 5 1.5 3 0 5.5-1.1 5.5-2.5v-4c0-1.2-1.8-2.2-4.3-2.4" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19M6.5 15h4" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v.01M18 14.5v.01" />
    </>
  ),
  door: (
    <>
      <path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M3.5 21h17" />
      <path d="M14.5 12.5v.01" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="5.5" r="2.5" />
      <path d="M8.5 21v-6l-1.5-1v-3.5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2V14l-1.5 1v6" />
    </>
  ),
  come: (
    <>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M5 21v-5.5l-1.5-1V11a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v3.5l-1.5 1V21" />
      <path d="M15 12h6.5M18.5 9l3 3-3 3" />
    </>
  ),
  window: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
      <path d="M12 3.5v17M4 11h16" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5l9.5 16.5h-19z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-6 w-6",
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  );
}

/**
 * ロゴ：キルギス国旗の太陽とトゥンドゥク（ユルトの天窓）。
 */
export function TundukMark({ className = "h-7 w-7", mono = false }: { className?: string; mono?: boolean }) {
  const rays = 20;
  const sun = mono ? "currentColor" : "var(--them)";
  const lines = mono ? "var(--bg)" : "var(--rec)";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={24 + Math.cos(a) * 15.5}
            y1={24 + Math.sin(a) * 15.5}
            x2={24 + Math.cos(a) * 22}
            y2={24 + Math.sin(a) * 22}
            stroke={sun}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="24" cy="24" r="12" fill={sun} />
      <g fill="none" stroke={lines} strokeWidth="1.8" strokeLinecap="round">
        <circle cx="24" cy="24" r="9" />
        <path d="M19.5 16.5c2 4.5 2 10.5 0 15M24 15v18M28.5 16.5c-2 4.5-2 10.5 0 15" />
        <path d="M16.5 19.5c4.5 2 10.5 2 15 0M16.5 28.5c4.5-2 10.5-2 15 0" />
      </g>
    </svg>
  );
}

/**
 * 帯模様：シルダク（フェルト絨毯）の「кочкор мүйүз（羊の角）」文様を繰り返す。
 */
export function OrnamentBand({ className = "", color = "var(--rec)" }: { className?: string; color?: string }) {
  // 同じページに複数置くと pattern の id が衝突するため、毎回固有の id にする
  const id = `kochkor-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg className={`ornament block h-3 w-full ${className}`} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="28" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M14 12V8.5C14 4.5 10.5 1.5 7 2.5 4.3 3.3 4 7 6.4 7.6 8.3 8 8.8 5.6 7.4 5M14 8.5C14 4.5 17.5 1.5 21 2.5 23.7 3.3 24 7 21.6 7.6 19.7 8 19.2 5.6 20.6 5M0 11h3M25 11h3"
            fill="none"
            stroke={color}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill={`url(#${id})`} />
    </svg>
  );
}
