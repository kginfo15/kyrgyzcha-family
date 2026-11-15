/**
 * 簡易レート制限（固定ウィンドウ、メモリ内）。
 * サーバーレス環境ではインスタンスごとの制限になるため「ベストエフォート」。
 * 厳密な制限が必要になったら Vercel Firewall や Upstash 等に置き換える。
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; reset: number }>();
  return function check(key: string, now = Date.now()): boolean {
    const h = hits.get(key);
    if (!h || h.reset <= now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
      }
      return true;
    }
    h.count++;
    return h.count <= limit;
  };
}
