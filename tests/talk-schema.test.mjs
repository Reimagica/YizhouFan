import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";

test("stores talk dates as validated year-month strings", async () => {
  const source = await readFile(new URL("../studio/schemaTypes/talk.ts", import.meta.url), "utf8");
  const dateField = source.match(/defineField\(\{[\s\S]*?name: "date"[\s\S]*?\}\),/)?.[0] ?? "";
  assert.match(dateField, /type: "string"/);
  assert.match(dateField, /YYYY-MM/);
  assert.match(dateField, /regex/);
  assert.doesNotMatch(dateField, /type: "date"|dateFormat/);
});
