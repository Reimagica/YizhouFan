type QuotaRule = { key: string; limit: number };

// Read-only: displaying availability must never consume a question.
export async function readAskQuota(visitorId: string, networkId: string) {
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  const minute = Math.floor(now / 60_000);
  const keys = [`day:${day}:browser:${visitorId}`, `day:${day}:network:${networkId}`, `day:${day}:site`, `minute:${minute}:browser:${visitorId}`, `minute:${minute}:network:${networkId}`];
  const endpoint = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  let counts: number[];
  if (!endpoint || !token) {
    if (process.env.NODE_ENV === "production") throw new Error("Quota unavailable");
    counts = keys.map((key) => { const value = memoryUsage.get(key); return value && value.expiresAt > now ? value.count : 0; });
  } else {
    const response = await fetch(endpoint, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["MGET", ...keys.map((key) => `yizhoufan:quota:${key}`)]),
      cache: "no-store", signal: AbortSignal.timeout(3_000),
    });
    const payload = await response.json() as { result?: unknown[] };
    if (!response.ok || !Array.isArray(payload.result) || payload.result.length !== keys.length) throw new Error("Quota unavailable");
    counts = payload.result.map((value) => value === null ? 0 : Number(value));
    if (counts.some((value) => !Number.isSafeInteger(value) || value < 0)) throw new Error("Invalid quota");
  }
  const remaining = Math.max(0, 8 - counts[0]);
  const dailyBlocked = remaining === 0 || counts[1] >= 32 || counts[2] >= 120;
  const minuteBlocked = counts[3] >= 3 || counts[4] >= 12;
  const resetsAt = new Date(`${day}T00:00:00Z`).getTime() + 86_400_000;
  return { remaining, limit: 8, blocked: dailyBlocked || minuteBlocked, reason: dailyBlocked ? "daily" : minuteBlocked ? "minute" : null,
    resetsAt, retryAt: dailyBlocked ? resetsAt : minuteBlocked ? (minute + 1) * 60_000 : null };
}

const memoryUsage = new Map<string, { expiresAt: number; count: number }>();

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function secondsUntilNextUtcDay() {
  const now = new Date();
  const tomorrow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(60, Math.ceil((tomorrow - now.getTime()) / 1000));
}

function consumeMemory(rules: QuotaRule[], ttlSeconds: number) {
  const now = Date.now();
  const current = rules.map((rule) => {
    const stored = memoryUsage.get(rule.key);
    return stored && stored.expiresAt > now ? stored.count : 0;
  });
  if (rules.some((rule, index) => current[index] >= rule.limit)) return false;
  const expiresAt = now + ttlSeconds * 1000;
  rules.forEach((rule, index) => memoryUsage.set(rule.key, { expiresAt, count: current[index] + 1 }));
  return true;
}

const incrementWithExpiry = `
for i, key in ipairs(KEYS) do
  local current = tonumber(redis.call('GET', key) or '0')
  local limit = tonumber(ARGV[i + 1])
  if current >= limit then
    return 0
  end
end
for i, key in ipairs(KEYS) do
  local current = redis.call('INCR', key)
  if current == 1 then
    redis.call('EXPIRE', key, ARGV[1])
  end
end
return 1
`;

async function consumeQuotaBundle(rules: QuotaRule[], ttlSeconds: number) {
  const endpoint = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!endpoint || !token) {
    if (process.env.NODE_ENV === "production") return false;
    return consumeMemory(rules, ttlSeconds);
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
        String(rules.length),
        ...rules.map((rule) => `yizhoufan:quota:${rule.key}`),
        String(ttlSeconds),
        ...rules.map((rule) => String(rule.limit)),
      ]),
      signal: AbortSignal.timeout(3_000),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const payload = await response.json() as { result?: number | string };
    return Number(payload.result) === 1;
  } catch {
    // A limiter outage must not become an unlimited path to a paid model.
    return false;
  }
}

export function consumeDailyQuotas(rules: QuotaRule[]) {
  const day = utcDay();
  return consumeQuotaBundle(rules.map((rule) => ({ ...rule, key: `day:${day}:${rule.key}` })), secondsUntilNextUtcDay());
}

export function consumeMinuteQuotas(rules: QuotaRule[]) {
  const minute = Math.floor(Date.now() / 60_000);
  return consumeQuotaBundle(rules.map((rule) => ({ ...rule, key: `minute:${minute}:${rule.key}` })), 70);
}
