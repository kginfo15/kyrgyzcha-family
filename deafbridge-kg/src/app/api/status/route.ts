import { connection } from "next/server";
import { getProvider, translationEnabled } from "@/lib/server/stt";
import { accessCodeRequired, MAX_SECONDS } from "@/lib/server/transcribe-handler";
import type { StatusResponse } from "@/lib/types";

export async function GET() {
  // 環境変数の変更をビルドし直さずに反映するため、リクエスト時に評価する
  await connection();
  const body: StatusResponse = {
    provider: getProvider().name,
    translation: translationEnabled(),
    accessCodeRequired: accessCodeRequired(),
    maxSeconds: MAX_SECONDS,
  };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
