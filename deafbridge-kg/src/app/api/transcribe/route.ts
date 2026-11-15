import { handleTranscribe } from "@/lib/server/transcribe-handler";

export async function POST(req: Request) {
  return handleTranscribe(req);
}
