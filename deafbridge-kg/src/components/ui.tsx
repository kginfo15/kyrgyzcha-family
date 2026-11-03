"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "./icons";

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

export { Icon, type IconName } from "./icons";
