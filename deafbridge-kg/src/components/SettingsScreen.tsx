"use client";

import type { PlayMethod, PlayRequest } from "@/lib/client/speak";
import { LANG_NAMES, type Dict } from "@/lib/i18n";
import { findPhrase, phraseText } from "@/lib/phrases";
import type { Settings } from "@/lib/settings";
import { CONV_LANGS, UI_LANGS, type StatusResponse } from "@/lib/types";
import { Card, Icon, Segmented } from "./ui";

export default function SettingsScreen({
  d,
  settings,
  status,
  onChange,
  onSpeak,
}: {
  d: Dict;
  settings: Settings;
  status: StatusResponse | null;
  onChange: (p: Partial<Settings>) => void;
  onSpeak: (r: PlayRequest) => PlayMethod;
}) {
  const onOff = [
    { value: "on" as const, label: d.on },
    { value: "off" as const, label: d.off },
  ];
  const b = (v: boolean) => (v ? "on" : "off");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black">{d.settingsTitle}</h1>

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
      <Segmented
        label={d.fontSize}
        value={settings.fontSize}
        options={[
          { value: "large", label: d.fontLarge },
          { value: "xlarge", label: d.fontXLarge },
        ]}
        onChange={(v) => onChange({ fontSize: v })}
      />
      <Segmented
        label={d.translate}
        value={b(settings.translate)}
        options={onOff}
        onChange={(v) => onChange({ translate: v === "on" })}
      />

      <div>
        <Segmented
          label={d.autoStop}
          value={b(settings.autoStop)}
          options={onOff}
          onChange={(v) => onChange({ autoStop: v === "on" })}
        />
        <p className="mt-1 text-sm text-muted">{d.autoStopHint}</p>
      </div>
      <div>
        <Segmented
          label={d.continuous}
          value={b(settings.continuous)}
          options={onOff}
          onChange={(v) => onChange({ continuous: v === "on" })}
        />
        <p className="mt-1 text-sm text-muted">{d.continuousHint}</p>
      </div>
      <Segmented
        label={d.sensitivity}
        value={settings.sensitivity}
        options={[
          { value: "low", label: d.sensLow },
          { value: "mid", label: d.sensMid },
          { value: "high", label: d.sensHigh },
        ]}
        onChange={(v) => onChange({ sensitivity: v })}
      />
      <Segmented
        label={d.maxSeconds}
        value={settings.maxSeconds}
        options={([8, 15, 30] as const).map((n) => ({ value: n, label: `${n}${d.seconds}` }))}
        onChange={(v) => onChange({ maxSeconds: v })}
      />

      <button
        type="button"
        onClick={() => {
          const p = findPhrase("app_info")!;
          onSpeak({ text: phraseText(p, settings.convLang), lang: settings.convLang, phraseId: p.id, ruFallback: p.ru });
        }}
        className="flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-accent font-bold text-accent"
      >
        <Icon name="speaker" />
        {d.testVoice}
      </button>

      {(status?.accessCodeRequired || settings.accessCode) && (
        <label className="flex flex-col gap-2">
          <span className="text-body font-bold">{d.accessCode}</span>
          <input
            type="password"
            autoComplete="off"
            value={settings.accessCode}
            onChange={(e) => onChange({ accessCode: e.target.value })}
            placeholder={d.accessCodeHint}
            className="min-h-14 rounded-xl border-2 border-line bg-surface px-3 text-body"
          />
        </label>
      )}

      <Card>
        <h2 className="text-body font-bold">{d.privacy}</h2>
        <p className="mt-1 text-body">{d.privacyText}</p>
      </Card>

      <Card>
        <h2 className="text-body font-bold">{d.serverStatus}</h2>
        <p className="mt-1 text-body">
          {status ? (status.provider === "google" ? `${d.connected} (Google)` : d.demo) : "—"}
        </p>
      </Card>
    </div>
  );
}
