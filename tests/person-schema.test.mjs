import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";

test("requires an enrollment year and one of six sorting roles without rendering either on cards", async () => {
  const schemaSource = await readFile(new URL("../studio/schemaTypes/person.ts", import.meta.url), "utf8");
  const querySource = await readFile(new URL("../lib/cms/content.ts", import.meta.url), "utf8");
  const cardSource = await readFile(new URL("../components/PeopleDirectory.tsx", import.meta.url), "utf8");
  const positionInputSource = await readFile(new URL("../studio/components/PersonPositionInput.tsx", import.meta.url), "utf8");
  const yearInputSource = await readFile(new URL("../studio/components/EnrollmentYearInput.tsx", import.meta.url), "utf8");

  assert.match(schemaSource, /name: "enrollmentYear"[\s\S]*?rule\.required\(\)\.integer\(\)/);
  assert.match(schemaSource, /description: "必填，用于成员排序"/);
  assert.match(schemaSource, /name: "positionMode"[\s\S]*?value: "template"[\s\S]*?value: "other"/);
  assert.match(schemaSource, /name: "position"[\s\S]*?components: \{input: PersonPositionInput\}/);
  assert.match(schemaSource, /其他身份请同时填写中文和英文。/);
  assert.match(schemaSource, /components: \{input: EnrollmentYearInput\}/);
  assert.match(schemaSource, /name: "memberRole"[\s\S]*?value: "postdoc"[\s\S]*?value: "phd"[\s\S]*?value: "masterToPhd"[\s\S]*?value: "master"[\s\S]*?value: "graduated"[\s\S]*?value: "other"/);
  assert.match(schemaSource, /rule\.required\(\)\.error\("请选择成员身份。"\)/);
  assert.match(schemaSource, /name: "order", title: "排列顺序"[\s\S]*?readOnly: true/);
  assert.doesNotMatch(schemaSource, /profileUrl|publicEmail/);
  assert.doesNotMatch(schemaSource, /待本人确认后补全/);
  assert.match(querySource, /memberRole/);
  assert.doesNotMatch(querySource, /order\(enrollmentYear desc, order asc/);
  assert.doesNotMatch(cardSource, /person-card__year|yearLabel|profileUrl|publicEmail/);
  assert.doesNotMatch(cardSource, /memberRole/);
  assert.match(positionInputSource, /北京大学教育学院\$\{year\}级/);
  assert.match(positionInputSource, /其他身份需同时填写中文和英文/);
  assert.match(yearInputSource, /请选择入学年份/);
});
