"use client";

import type { Dict } from "@/lib/i18n";
import { JaGloss, Tx, useI18n } from "./i18n-context";
import type { LogEntry, ShowText } from "./types";
import { Icon, Sheet } from "./ui";

/** 会話履歴（メモリ上のみ。アプリを閉じると消える） */
export default function HistorySheet({
  log,
  onShow,
  onClear,
  onClose,
}: {
  log: LogEntry[];
  onShow: (s: ShowText) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const { d, uiLang } = useI18n();
  return (
    <Sheet
      title={<Tx k="history" />}
      onClose={onClose}
      closeLabel={d.close}
      footer={
        <button
          type="button"
          onClick={() => {
            onClear();
            onClose();
          }}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-2 font-bold text-muted"
        >
          <Icon name="trash" className="h-5 w-5" />
          <Tx k="clearLog" />
        </button>
      }
    >
      <ol className="flex flex-col gap-2">
        {log.map((e) => {
          const mine = e.who === "me";
          const time = new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return (
            <li key={e.id} className={mine ? "ml-10" : "mr-10"}>
              <button
                type="button"
                onClick={() =>
                  e.status === "done" && onShow({ text: e.text, sub: e.translations?.[uiLang], ja: e.translations?.ja })
                }
                className={`w-full rounded-2xl px-3 py-2 text-left ${
                  mine ? "rounded-br-md bg-me" : "rounded-bl-md border border-them/40 bg-them-soft"
                }`}
              >
                <span className="block text-xs font-bold text-muted">
                  {mine ? <Tx k="me" /> : <Tx k="them" />} · {time}
                </span>
                <span className="block text-body font-bold" lang={e.lang}>
                  {e.status === "processing" ? (
                    <Tx k="processing" />
                  ) : e.status === "empty" ? (
                    <Tx k="noSpeech" />
                  ) : e.status === "error" ? (
                    <Tx k={e.error as keyof Dict} />
                  ) : (
                    e.text
                  )}
                </span>
                {e.translations?.[uiLang] && e.lang !== uiLang && (
                  <span className="block text-sm text-muted">{e.translations[uiLang]}</span>
                )}
                {e.translations?.ja && (
                  <span className="block text-sm text-muted">
                    <JaGloss>{e.translations.ja}</JaGloss>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </Sheet>
  );
}
