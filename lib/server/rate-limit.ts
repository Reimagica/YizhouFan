const memoryUsage = new Map<string, { day: string; count: number }>();

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function secondsUntilNextUtcDay() {
  const now = new Date();
  const tomorrow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(60, Math.ceil((tomorrow - now.getTime()) / 1000));
}

function consumeMemory(key: string, limit: number) {
  const day = utcDay();
  const current = memoryUsage.get(key);
  const count = current?.day === day ? current.count : 0;
  if (count >= limit) return false;
  memoryUsage.set(key, { day, count: count + 1 });
  return true;
}

const incrementWithExpiry = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return current
`;

export async function consumeDailyQuota(key: string, limit: number) {
  const endpoint = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!endpoint || !token) {
    if (process.env.NODE_ENV === "production") return false;
    return consumeMemory(key, limit);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        incrementWithExpiry,
        "1",
        `yizhoufan:quota:${utcDay()}:${key}`,
        String(secondsUntilNextUtcDay()),
      ]),
      signal: AbortSignal.timeout(3_000),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const payload = await response.json() as { result?: number | string };
    const count = Number(payload.result);
    return Number.isFinite(count) && count <= limit;
  } catch {
    // A limiter outage must not become an unlimited path to a paid model.
    return false;
  }
}
