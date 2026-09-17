import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";

test("requires bilingual, descriptive alternative text for new report images", async () => {
  const schemaSource = await readFile(new URL("../studio/schemaTypes/shared.ts", import.meta.url), "utf8");
  const rendererSource = await readFile(new URL("../components/PortableContent.tsx", import.meta.url), "utf8");

  assert.match(schemaSource, /name: "alt"[\s\S]*?rule\.required\(\)\.custom/);
  assert.match(schemaSource, /alt\?\.en\?\.trim\(\) && alt\?\.zh\?\.trim\(\)/);
  assert.match(schemaSource, /不要堆砌关键词/);
  assert.match(rendererSource, /function localizedImageAlt/);
  assert.match(rendererSource, /primary \|\| fallback \|\| ""/);
});
