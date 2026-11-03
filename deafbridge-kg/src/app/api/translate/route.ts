import { handleTranslate } from "@/lib/server/translate-handler";

export async function POST(req: Request) {
  return handleTranslate(req);
}
