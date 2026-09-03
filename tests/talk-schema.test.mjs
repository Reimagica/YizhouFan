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

test("supports multiple copyright-cleared PDF or PPTX attachments", async () => {
  const talkSource = await readFile(new URL("../studio/schemaTypes/talk.ts", import.meta.url), "utf8");
  const sharedSource = await readFile(new URL("../studio/schemaTypes/shared.ts", import.meta.url), "utf8");
  assert.match(talkSource, /name: "attachments"[\s\S]*?type: "array"[\s\S]*?reportAttachment/);
  assert.match(sharedSource, /application\/pdf,application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation/);
  assert.match(sharedSource, /copyrightCleared/);
  assert.match(sharedSource, /80 \* 1024 \* 1024/);
});
