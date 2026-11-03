import type { ConvLang, StatusResponse, TranscribeError, TranscribeResult, UiLang } from "../types";

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
  ui: UiLang | null,
  accessCode: string,
): Promise<TranscribeResult | TranscribeError> {
  const params = new URLSearchParams({ lang });
  if (ui) params.set("ui", ui);
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
