import type { ConvLang, StatusResponse, TranscribeError, TranscribeResult, TransLang } from "../types";

export async function fetchStatus(): Promise<StatusResponse | null> {
  try {
    const res = await fetch("/api/status", { cache: "no-store" });
    return res.ok ? ((await res.json()) as StatusResponse) : null;
  } catch {
    return null;
  }
}

export async function transcribe(
  wav: Blob,
  lang: ConvLang,
  targets: TransLang[],
  accessCode: string,
): Promise<TranscribeResult | TranscribeError> {
  const params = new URLSearchParams({ lang });
  if (targets.length) params.set("tr", targets.join(","));
  try {
    const res = await fetch(`/api/transcribe?${params}`, {
      method: "POST",
      headers: {
        "Content-Type": "audio/wav",
        ...(accessCode ? { "X-Access-Code": accessCode } : {}),
      },
      body: wav,
    });
    const data = (await res.json().catch(() => null)) as TranscribeResult | TranscribeError | null;
    if (data) return data;
    return { ok: false, error: "provider_error", message: `HTTP ${res.status}` };
  } catch {
    return { ok: false, error: "provider_error", message: "network" };
  }
}

/** 相手が手で書いた文を翻訳する（失敗しても原文は表示できるので空で返す） */
export async function translateText(
  text: string,
  from: ConvLang,
  targets: TransLang[],
  accessCode: string,
): Promise<Partial<Record<TransLang, string>>> {
  if (!targets.length) return {};
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessCode ? { "X-Access-Code": accessCode } : {}) },
      body: JSON.stringify({ text, from, targets }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; translations?: Partial<Record<TransLang, string>> } | null;
    return data?.ok && data.translations ? data.translations : {};
  } catch {
    return {};
  }
}
