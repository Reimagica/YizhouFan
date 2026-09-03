import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";

test("requires an enrollment year for backend sorting without rendering it on cards", async () => {
  const schemaSource = await readFile(new URL("../studio/schemaTypes/person.ts", import.meta.url), "utf8");
  const querySource = await readFile(new URL("../lib/cms/content.ts", import.meta.url), "utf8");
  const cardSource = await readFile(new URL("../components/PeopleDirectory.tsx", import.meta.url), "utf8");

  assert.match(schemaSource, /name: "enrollmentYear"[\s\S]*?rule\.required\(\)\.integer\(\)/);
  assert.match(querySource, /order\(enrollmentYear desc, order asc, name\.en asc\)/);
  assert.doesNotMatch(cardSource, /person-card__year|yearLabel/);
});
