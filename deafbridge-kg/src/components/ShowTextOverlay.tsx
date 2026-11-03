"use client";

import { useEffect } from "react";
import { Icon, OrnamentBand } from "./icons";

/**
 * 相手（窓口の人・カメラ付きインターフォン）に画面を見せるための全画面表示。
 * text = 相手の言語。sub = 利用者の画面の言語での意味。ja = 日本語補助（確認用）。
 */
export default function ShowTextOverlay({
  text,
  sub,
  ja,
  closeLabel,
  onClose,
}: {
  text: string;
  sub?: string;
  ja?: string;
  closeLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 文字数に応じて最大サイズで表示
  const size = text.length < 20 ? "15vw" : text.length < 45 ? "10vw" : text.length < 90 ? "7.5vw" : "6vw";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="pt-safe fixed inset-0 z-50 flex flex-col bg-black text-white"
      onClick={onClose}
    >
      <OrnamentBand className="mt-2 opacity-80" />
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-center font-black leading-tight" style={{ fontSize: `min(${size}, 5rem)` }}>
          {text}
        </p>
      </div>
      {sub && sub !== text && <p className="px-6 pb-2 text-center text-xl text-neutral-300">{sub}</p>}
      {ja && (
        <p className="px-6 pb-4 text-center text-base text-neutral-400" lang="ja">
          <span className="mr-1.5 text-xs font-extrabold tracking-widest opacity-70">JA</span>
          {ja}
        </p>
      )}
      <OrnamentBand className="mb-4 opacity-80" color="var(--them)" />
      <button
        type="button"
        onClick={onClose}
        className="pb-safe mx-6 mb-6 flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-white text-xl font-bold text-black"
      >
        <Icon name="close" />
        {closeLabel}
      </button>
    </div>
  );
}
