"use client";

import { Icon } from "./icons";

/**
 * 録音ボタン。周りのリングはユルトの天窓「トゥンドゥク」をかたどり、
 * 音量に合わせてスポークが光る（音が聞こえない利用者が「拾えているか」を見て分かるように）。
 * 大きさは画面の高さに応じて CSS 変数 --mic で変わる（globals.css）。
 */
export default function MicButton({
  cta = false,
  listening,
  starting,
  level,
  speaking,
  label,
  onClick,
}: {
  /** まだ何もしていない時に「ここを押す」と分かるよう、ゆっくり脈打たせる */
  cta?: boolean;
  listening: boolean;
  starting: boolean;
  /** 0〜1 に正規化した音量 */
  level: number;
  speaking: boolean;
  label: string;
  onClick: () => void;
}) {
  const spokes = 16;
  const lit = listening ? Math.round(level * spokes) : 0;
  const color = speaking ? "var(--them)" : listening ? "var(--rec)" : "var(--fg)";
  const glow = speaking ? "mic-glow-them" : listening ? "mic-glow-rec" : "";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={starting}
      aria-label={label}
      className="mic relative flex shrink-0 items-center justify-center rounded-full disabled:opacity-60"
    >
      {cta && !listening && <span aria-hidden="true" className="mic-cta absolute inset-0 rounded-full" />}
      <svg viewBox="0 0 104 104" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="52" cy="52" r="50" fill="none" stroke="var(--border)" strokeWidth="1.5" />
        {Array.from({ length: spokes }, (_, i) => {
          const a = (i / spokes) * Math.PI * 2 - Math.PI / 2;
          const on = i < lit;
          return (
            <line
              key={i}
              x1={52 + Math.cos(a) * 42.5}
              y1={52 + Math.sin(a) * 42.5}
              x2={52 + Math.cos(a) * 49}
              y2={52 + Math.sin(a) * 49}
              stroke={on ? color : "var(--border)"}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transition: "stroke 80ms" }}
            />
          );
        })}
      </svg>
      <span
        className={`mic-core flex items-center justify-center rounded-full transition-[background-color,box-shadow] duration-200 ${glow} ${
          listening ? "bg-rec text-rec-fg" : "bg-fg text-bg"
        }`}
      >
        <Icon name={listening ? "stop" : "mic"} className="h-[42%] w-[42%]" strokeWidth={2} />
      </span>
    </button>
  );
}
