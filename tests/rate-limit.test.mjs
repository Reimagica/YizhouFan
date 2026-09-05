import assert from "node:assert/strict";
import {test} from "node:test";
import {consumeDailyQuotas, consumeMinuteQuotas, readAskQuota} from "../lib/server/rate-limit.ts";

test("quota reads do not consume; daily exhaustion persists and resets next UTC day", async () => {
  const original = Date.now;
  const RealDate = Date;
  let now = Date.parse("2026-09-05T12:00:00Z");
  globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
  try {
    assert.equal((await readAskQuota("daily-test", "network-test")).remaining, 8);
    assert.equal((await readAskQuota("daily-test", "network-test")).remaining, 8);
    for (let i = 0; i < 8; i++) assert.equal(await consumeDailyQuotas([{key: "browser:daily-test", limit: 8}]), true);
    assert.equal(await consumeDailyQuotas([{key: "browser:daily-test", limit: 8}]), false);
    const exhausted = await readAskQuota("daily-test", "network-test");
    assert.equal(exhausted.remaining, 0);
    assert.equal(exhausted.blocked, true);
    now = exhausted.resetsAt + 1;
    assert.equal((await readAskQuota("daily-test", "network-test")).remaining, 8);
  } finally { globalThis.Date = RealDate; Date.now = original; }
});

test("minute pause preserves daily remaining and network daily cap blocks browser", async () => {
  for (let i = 0; i < 3; i++) await consumeMinuteQuotas([{key: "browser:minute-test", limit: 3}]);
  const paused = await readAskQuota("minute-test", "network-minute");
  assert.equal(paused.remaining, 8);
  assert.equal(paused.reason, "minute");
  for (let i = 0; i < 32; i++) await consumeDailyQuotas([{key: "network:network-cap", limit: 32}]);
  const network = await readAskQuota("fresh-browser", "network-cap");
  assert.equal(network.remaining, 8);
  assert.equal(network.blocked, true);
  assert.equal(network.reason, "daily");
});

test("production refuses quota reads when persistence is unavailable", async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try { await assert.rejects(readAskQuota("test", "test")); }
  finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
