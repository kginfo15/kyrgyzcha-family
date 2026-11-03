"use client";

import type { Dict } from "@/lib/i18n";
import { LANG_NAMES } from "@/lib/i18n";
import type { Settings } from "@/lib/settings";
import { CONV_LANGS, UI_LANGS } from "@/lib/types";
import { Icon, Segmented } from "./ui";

export default function HomeScreen({
  d,
  settings,
  demo,
  onChange,
  onStart,
}: {
  d: Dict;
  settings: Settings;
  demo: boolean;
  onChange: (p: Partial<Settings>) => void;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent text-accent-fg">
          <Icon name="ear" className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-black">
          DeafBridge <span className="text-accent">KG</span>
        </h1>
        <p className="mt-1 text-body text-muted">{d.tagline}</p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="flex min-h-28 items-center justify-center gap-3 rounded-3xl bg-accent px-6 text-3xl font-black text-accent-fg shadow-lg active:scale-[0.98]"
      >
        <Icon name="mic" className="h-10 w-10" />
        {d.start}
      </button>

      <p className="text-center text-body font-bold">{d.holdNear}</p>

      <Segmented
        label={d.convLang}
        value={settings.convLang}
        options={CONV_LANGS.map((l) => ({ value: l, label: LANG_NAMES[l] }))}
        onChange={(v) => onChange({ convLang: v })}
      />
      <Segmented
        label={d.uiLang}
        value={settings.uiLang}
        options={UI_LANGS.map((l) => ({ value: l, label: LANG_NAMES[l] }))}
        onChange={(v) => onChange({ uiLang: v })}
      />

      {demo && <p className="rounded-xl border-2 border-warn p-3 text-sm">{d.demoMode}</p>}
      <p className="text-sm text-muted">{d.privacyText}</p>
    </div>
  );
}
