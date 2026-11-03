"use client";

import { Icon } from "./ui";

/**
 * 録音ボタン。周りのリングはユルトの天窓「トゥンドゥク」をかたどり、
 * 音量に合わせてスポークが光る（音が聞こえない利用者が「拾えているか」を見て分かるように）。
 */
export default function MicButton({
  listening,
  starting,
  level,
  speaking,
  label,
  onClick,
}: {
  listening: boolean;
  starting: boolean;
  /** 0〜1 に正規化した音量 */
  level: number;
  speaking: boolean;
  label: string;
  onClick: () => void;
}) {
  const spokes = 12;
  const lit = listening ? Math.round(level * spokes) : 0;
  const ringColor = speaking ? "var(--them)" : listening ? "var(--rec)" : "var(--accent)";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={starting}
      aria-label={label}
      className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-full disabled:opacity-60"
    >
      <svg viewBox="0 0 104 104" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="52" cy="52" r="49" fill="none" stroke="var(--border)" strokeWidth="2" />
        {Array.from({ length: spokes }, (_, i) => {
          const a = (i / spokes) * Math.PI * 2 - Math.PI / 2;
          const on = i < lit;
          return (
            <line
              key={i}
              x1={52 + Math.cos(a) * 41}
              y1={52 + Math.sin(a) * 41}
              x2={52 + Math.cos(a) * 49}
              y2={52 + Math.sin(a) * 49}
              stroke={on ? ringColor : "var(--border)"}
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{ transition: "stroke 80ms" }}
            />
          );
        })}
      </svg>
      <span
        className={`flex h-[74px] w-[74px] items-center justify-center rounded-full shadow-lg transition ${
          listening ? "bg-rec text-rec-fg" : "bg-accent text-accent-fg"
        }`}
      >
        <Icon name={listening ? "stop" : "mic"} className="h-9 w-9" />
      </span>
    </button>
  );
}
