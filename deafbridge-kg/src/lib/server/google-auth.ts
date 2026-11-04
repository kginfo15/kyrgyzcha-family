import { createSign } from "node:crypto";

/**
 * Google Cloud 認証。2通りに対応:
 *   1. GOOGLE_API_KEY                 … API キー（最も簡単。必ず API 制限を設定すること）
 *   2. GOOGLE_SERVICE_ACCOUNT_JSON    … サービスアカウント JSON（そのまま or base64）
 *
 * どちらもサーバー環境変数にのみ置き、ブラウザには絶対に渡さない。
 */

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };

export type GoogleAuth =
  | { kind: "apiKey"; key: string }
  | { kind: "serviceAccount"; sa: ServiceAccount };

export function readGoogleAuth(env: NodeJS.ProcessEnv = process.env): GoogleAuth | null {
  const saRaw = env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (saRaw) {
    try {
      const json = saRaw.startsWith("{") ? saRaw : Buffer.from(saRaw, "base64").toString("utf8");
      const sa = JSON.parse(json) as ServiceAccount;
      if (sa.client_email && sa.private_key) return { kind: "serviceAccount", sa };
    } catch {
      console.error("[auth] GOOGLE_SERVICE_ACCOUNT_JSON を解析できません");
    }
  }
  const key = env.GOOGLE_API_KEY?.trim();
  if (key) return { kind: "apiKey", key };
  return null;
}

const SCOPE = "https://www.googleapis.com/auth/cloud-platform";
let cachedToken: { token: string; exp: number; email: string } | null = null;

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.email === sa.client_email && cachedToken.exp - 60 > now) {
    return cachedToken.token;
  }
  const tokenUri = sa.token_uri || "https://oauth2.googleapis.com/token";
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const signature = b64url(signer.sign(sa.private_key));
  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, exp: now + data.expires_in, email: sa.client_email };
  return data.access_token;
}

/** 認証付きで Google API に POST する */
export async function googlePost(
  auth: GoogleAuth,
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let target = url;
  if (auth.kind === "apiKey") {
    target += (url.includes("?") ? "&" : "?") + "key=" + encodeURIComponent(auth.key);
  } else {
    headers.Authorization = `Bearer ${await getAccessToken(auth.sa)}`;
  }
  return fetch(target, { method: "POST", headers, body: JSON.stringify(body), signal });
}
