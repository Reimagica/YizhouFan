import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";

test("requires an enrollment year and one of four member roles without rendering the year on cards", async () => {
  const schemaSource = await readFile(new URL("../studio/schemaTypes/person.ts", import.meta.url), "utf8");
  const querySource = await readFile(new URL("../lib/cms/content.ts", import.meta.url), "utf8");
  const cardSource = await readFile(new URL("../components/PeopleDirectory.tsx", import.meta.url), "utf8");

  assert.match(schemaSource, /name: "enrollmentYear"[\s\S]*?rule\.required\(\)\.integer\(\)/);
  assert.match(schemaSource, /name: "memberRole"[\s\S]*?value: "master"[\s\S]*?value: "phd"[\s\S]*?value: "masterToPhd"[\s\S]*?value: "graduated"/);
  assert.match(schemaSource, /return "请选择成员身份。"/);
  assert.match(querySource, /memberRole/);
  assert.doesNotMatch(querySource, /order\(enrollmentYear desc, order asc/);
  assert.doesNotMatch(cardSource, /person-card__year|yearLabel/);
});
