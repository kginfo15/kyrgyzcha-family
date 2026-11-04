"use client";

import { useEffect, useRef, useState } from "react";
import { DICTS } from "@/lib/i18n";
import { findPhrase, phraseText } from "@/lib/phrases";
import type { ConvLang } from "@/lib/types";
import { Icon } from "./icons";
import { Sheet } from "./ui";

/**
 * 対面モード：相手（窓口の人）に手で書いてもらうパネル。
 * 相手が使うので、表示はすべて相手の言語。音声認識を使わないので費用もかからない。
 */
export default function StaffTypeSheet({
  lang,
  onSubmit,
  onClose,
}: {
  lang: ConvLang;
  onSubmit: (text: string) => void;
  onClose: () => void;
}) {
  const staff = DICTS[lang];
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit(t.slice(0, 500));
    onClose();
  };
  return (
    <Sheet
      title={<span lang={lang}>{phraseText(findPhrase("type_here")!, lang)}</span>}
      onClose={onClose}
      closeLabel={staff.close}
      footer={
        <button
          type="button"
          onClick={send}
          disabled={!text.trim()}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-them text-lg font-extrabold text-them-ink disabled:opacity-40"
        >
          <Icon name="check-mark" className="h-5 w-5" strokeWidth={2.6} />
          <span lang={lang}>{staff.send}</span>
        </button>
      }
    >
      <textarea
        id="staff-text"
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={staff.staffPlaceholder}
        aria-label={staff.staffPlaceholder}
        maxLength={500}
        rows={5}
        lang={lang}
        className="w-full resize-none rounded-2xl border border-line bg-surface p-4 text-2xl font-bold leading-snug placeholder:text-muted"
      />
    </Sheet>
  );
}
