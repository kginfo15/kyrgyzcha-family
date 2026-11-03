"use client";

import { LANG_NAMES, LANG_NAMES_JA, type Dict } from "@/lib/i18n";
import { findPhrase } from "@/lib/phrases";
import type { Settings } from "@/lib/settings";
import { CONV_LANGS, UI_LANGS, type StatusResponse } from "@/lib/types";
import { JaGloss, Tx, useI18n } from "./i18n-context";
import { speakPhrase } from "./speak-phrase";
import type { SpeakFn } from "./types";
import { Icon, Segmented, Sheet } from "./ui";

function LangLabel({ l }: { l: keyof typeof LANG_NAMES }) {
  return (
    <span className="tx">
      {LANG_NAMES[l]}
      <JaGloss>{LANG_NAMES_JA[l]}</JaGloss>
    </span>
  );
}

function Hint({ k }: { k: keyof Dict }) {
  return (
    <p className="mt-1.5 text-sm text-muted">
      <Tx k={k} />
    </p>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-4">{children}</div>;
}

export default function SettingsSheet({
  settings,
  status,
  onChange,
  onSpeak,
  onClose,
}: {
  settings: Settings;
  status: StatusResponse | null;
  onChange: (p: Partial<Settings>) => void;
  onSpeak: SpeakFn;
  onClose: () => void;
}) {
  const { d } = useI18n();
  const onOff = [
    { value: "on" as const, label: <Tx k="on" /> },
    { value: "off" as const, label: <Tx k="off" /> },
  ];
  const b = (v: boolean) => (v ? "on" : "off");

  return (
    <Sheet title={<Tx k="settingsTitle" />} onClose={onClose} closeLabel={d.close}>
      <div className="flex flex-col gap-4 pb-2">
        <Group>
          <Segmented
            label={<Tx k="convLang" />}
            value={settings.convLang}
            options={CONV_LANGS.map((l) => ({ value: l, label: <LangLabel l={l} /> }))}
            onChange={(v) => onChange({ convLang: v })}
          />
          <Segmented
            label={<Tx k="uiLang" />}
            value={settings.uiLang}
            options={UI_LANGS.map((l) => ({ value: l, label: <LangLabel l={l} /> }))}
            onChange={(v) => onChange({ uiLang: v })}
          />
          <Segmented
            label={<Tx k="translate" />}
            value={b(settings.translate)}
            options={onOff}
            onChange={(v) => onChange({ translate: v === "on" })}
          />
          <div>
            <Segmented
              label={<Tx k="jaAssist" />}
              value={b(settings.jaAssist)}
              options={onOff}
              onChange={(v) => onChange({ jaAssist: v === "on" })}
            />
            {/* オフにしても戻し方が分かるよう、この説明だけは常に日本語も出す */}
            <p className="mt-1.5 text-sm text-muted">
              <Tx k="jaAssistHint" />
              {!settings.jaAssist && (
                <JaGloss force>確認用の日本語表示。右上の「日本語」ボタンでも切り替えられます。</JaGloss>
              )}
            </p>
          </div>
        </Group>

        <Group>
          <Segmented
            label={<Tx k="fontSize" />}
            value={settings.fontSize}
            options={[
              { value: "large", label: <Tx k="fontLarge" /> },
              { value: "xlarge", label: <Tx k="fontXLarge" /> },
            ]}
            onChange={(v) => onChange({ fontSize: v })}
          />
          <div>
            <Segmented
              label={<Tx k="visualAlert" />}
              value={b(settings.visualAlert)}
              options={onOff}
              onChange={(v) => onChange({ visualAlert: v === "on" })}
            />
            <Hint k="visualAlertHint" />
          </div>
        </Group>

        <Group>
          <div>
            <Segmented
              label={<Tx k="autoStop" />}
              value={b(settings.autoStop)}
              options={onOff}
              onChange={(v) => onChange({ autoStop: v === "on" })}
            />
            <Hint k="autoStopHint" />
          </div>
          <div>
            <Segmented
              label={<Tx k="continuous" />}
              value={b(settings.continuous)}
              options={onOff}
              onChange={(v) => onChange({ continuous: v === "on" })}
            />
            <Hint k="continuousHint" />
          </div>
          <Segmented
            label={<Tx k="sensitivity" />}
            value={settings.sensitivity}
            options={[
              { value: "low", label: <Tx k="sensLow" /> },
              { value: "mid", label: <Tx k="sensMid" /> },
              { value: "high", label: <Tx k="sensHigh" /> },
            ]}
            onChange={(v) => onChange({ sensitivity: v })}
          />
          <Segmented
            label={<Tx k="maxSeconds" />}
            value={settings.maxSeconds}
            options={([8, 15, 30] as const).map((n) => ({ value: n, label: `${n}s` }))}
            onChange={(v) => onChange({ maxSeconds: v })}
          />
          <button
            type="button"
            onClick={() => speakPhrase(onSpeak, findPhrase("app_info")!, settings)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-surface-2 font-bold"
          >
            <Icon name="speaker" className="h-5 w-5 shrink-0" />
            <Tx k="testVoice" />
          </button>
        </Group>

        {(status?.accessCodeRequired || settings.accessCode) && (
          <Group>
            <label className="flex flex-col gap-2" htmlFor="access-code">
              <span className="text-sm font-bold text-muted">
                <Tx k="accessCode" />
              </span>
              <input
                id="access-code"
                type="password"
                autoComplete="off"
                value={settings.accessCode}
                onChange={(e) => onChange({ accessCode: e.target.value })}
                className="min-h-12 rounded-xl border border-line bg-bg px-3 text-body"
              />
              <Hint k="accessCodeHint" />
            </label>
          </Group>
        )}

        <Group>
          <div>
            <h3 className="text-sm font-bold text-muted">
              <Tx k="privacy" />
            </h3>
            <p className="mt-1 text-sm">
              <Tx k="privacyText" />
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted">
              <Tx k="serverStatus" />
            </h3>
            <p className="mt-1 text-sm font-bold">
              {status ? (
                status.provider === "google" ? (
                  <>
                    <Tx k="connected" /> · Google
                  </>
                ) : (
                  <Tx k="demoMode" />
                )
              ) : (
                "—"
              )}
            </p>
          </div>
        </Group>
      </div>
    </Sheet>
  );
}
