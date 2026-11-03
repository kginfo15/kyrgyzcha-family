"use client";

import { LANG_NAMES, LANG_NAMES_JA } from "@/lib/i18n";
import type { Settings } from "@/lib/settings";
import { CONV_LANGS, UI_LANGS } from "@/lib/types";
import { JaGloss, Tx } from "./i18n-context";
import { Icon, Segmented } from "./ui";

export default function HomeScreen({
  settings,
  demo,
  onChange,
  onStart,
}: {
  settings: Settings;
  demo: boolean;
  onChange: (p: Partial<Settings>) => void;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent text-5xl">
          🧏
        </div>
        <h1 className="text-3xl font-black">
          DeafBridge <span className="text-accent">KG</span>
        </h1>
        <p className="mt-1 text-body text-muted">
          <Tx k="tagline" />
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="flex min-h-28 items-center justify-center gap-3 rounded-3xl bg-accent px-6 text-3xl font-black text-accent-fg shadow-lg active:scale-[0.98]"
      >
        <Icon name="mic" className="h-10 w-10 shrink-0" />
        <Tx k="start" />
      </button>

      {/* 使い方を絵と短い文で（文字が苦手な人にも分かるように） */}
      <ol className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <li className="rounded-xl border border-line bg-surface p-2">
          <div className="text-3xl">📱➡️🔊</div>
          <Tx k="stepHold" />
        </li>
        <li className="rounded-xl border border-line bg-surface p-2">
          <div className="text-3xl">🔔</div>
          <Tx k="stepRing" />
        </li>
        <li className="rounded-xl border border-line bg-surface p-2">
          <div className="text-3xl">👀💬</div>
          <Tx k="stepRead" />
        </li>
      </ol>

      <Segmented
        label={<Tx k="convLang" />}
        value={settings.convLang}
        options={CONV_LANGS.map((l) => ({
          value: l,
          label: (
            <span className="tx">
              {LANG_NAMES[l]}
              <JaGloss>{LANG_NAMES_JA[l]}</JaGloss>
            </span>
          ),
        }))}
        onChange={(v) => onChange({ convLang: v })}
      />
      <Segmented
        label={<Tx k="uiLang" />}
        value={settings.uiLang}
        options={UI_LANGS.map((l) => ({
          value: l,
          label: (
            <span className="tx">
              {LANG_NAMES[l]}
              <JaGloss>{LANG_NAMES_JA[l]}</JaGloss>
            </span>
          ),
        }))}
        onChange={(v) => onChange({ uiLang: v })}
      />

      {demo && (
        <p className="rounded-xl border-2 border-warn p-3 text-sm">
          <Tx k="demoMode" />
        </p>
      )}
      <p className="text-sm text-muted">
        <Tx k="privacyText" />
      </p>
    </div>
  );
}
