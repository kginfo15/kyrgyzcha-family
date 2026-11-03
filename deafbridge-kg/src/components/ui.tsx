"use client";

import { useEffect, type ReactNode } from "react";

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: ReactNode;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-bold text-muted">{label}</legend>
      <div
        className="grid gap-1 rounded-2xl bg-surface-2 p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={`min-h-12 rounded-xl px-2 py-1.5 text-body font-bold leading-tight transition ${
                active ? "bg-accent text-accent-fg shadow-sm" : "text-fg/80"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** 下から出てくるパネル。メイン画面はスクロールさせず、詳細はここで扱う。 */
export function Sheet({
  title,
  onClose,
  closeLabel,
  children,
  footer,
}: {
  title: ReactNode;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={closeLabel}
        tabIndex={-1}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="sheet-in relative mx-auto flex max-h-[90dvh] w-full max-w-xl flex-col rounded-t-3xl border-t border-line bg-bg">
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3">
          <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-line absolute left-1/2 top-1.5 -translate-x-1/2" />
          <h2 className="pt-2 text-xl font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && <div className="pb-safe border-t border-line px-5 pt-3">{footer}</div>}
        {!footer && <div className="pb-safe" />}
      </div>
    </div>
  );
}

export function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
    stop: <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="currentColor" stroke="none" />,
    chat: <path d="M4 5h16v11H9l-5 4z" />,
    gear: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
      </>
    ),
    ear: <path d="M8 9a4 4 0 1 1 8 0c0 3-3 4-3 7a3 3 0 0 1-6 0M10 9a2 2 0 0 1 4 0" />,
    speaker: (
      <>
        <path d="M4 9h4l5-4v14l-5-4H4z" />
        <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
      </>
    ),
    screen: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6 6 18" />,
    trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
    grid: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
    keyboard: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </>
    ),
    swap: <path d="M7 7h12l-3-3M17 17H5l3 3" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export type IconName =
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
  | "swap";
