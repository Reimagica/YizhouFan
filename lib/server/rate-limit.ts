type QuotaRule = { key: string; limit: number };

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
