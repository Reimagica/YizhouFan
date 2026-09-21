import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";

test("uses category-specific Studio entry points and conditional alumni fields", async () => {
  const schemaSource = await readFile(new URL("../studio/schemaTypes/person.ts", import.meta.url), "utf8");
  const configSource = await readFile(new URL("../studio/sanity.config.ts", import.meta.url), "utf8");
  const querySource = await readFile(new URL("../lib/cms/content.ts", import.meta.url), "utf8");
  const cardSource = await readFile(new URL("../components/PeopleDirectory.tsx", import.meta.url), "utf8");
  const yearInputSource = await readFile(new URL("../studio/components/PersonYearInput.tsx", import.meta.url), "utf8");

  assert.match(schemaSource, /name: "memberCategory"[\s\S]*?hidden: true[\s\S]*?readOnly: true/);
  assert.match(schemaSource, /name: "enrollmentYear"[\s\S]*?description: "必填"/);
  assert.doesNotMatch(schemaSource, /name: "enrollmentYear"[\s\S]*?hidden: \(\{document\}\) => isAlumni\(document\)/);
  assert.doesNotMatch(schemaSource, /name: "graduationYear"/);
  assert.match(schemaSource, /name: "alumniIdentity"[\s\S]*?title: "身份"[\s\S]*?value: "postdoc"[\s\S]*?value: "phd"[\s\S]*?value: "master"[\s\S]*?value: "visiting"/);
  assert.match(schemaSource, /name: "destination"[\s\S]*?请填写中文和英文毕业去向/);
  assert.doesNotMatch(schemaSource, /PersonPositionInput/);
  assert.match(schemaSource, /name: "position", type: "localizedString", hidden: true, readOnly: true/);
  assert.doesNotMatch(schemaSource, /profileUrl|publicEmail/);

  for (const category of ["postdoc", "phd", "master", "visiting", "alumni"]) {
    assert.match(configSource, new RegExp(`value: "${category}"`));
    assert.match(configSource, new RegExp(`person-\\$\\{category\\.value\\}`));
  }
  assert.match(configSource, /initialValueTemplates/);
  assert.match(configSource, /templates\.filter\(\(template\) => template\.schemaType !== "person"\)/);

  assert.match(querySource, /memberCategory/);
  assert.doesNotMatch(querySource, /graduationYear/);
  assert.match(querySource, /alumniIdentity/);
  assert.match(querySource, /destination\.en/);
  assert.doesNotMatch(querySource, /peopleQuery[\s\S]*?order\(enrollmentYear/);

  assert.match(cardSource, /groupPeople/);
  assert.match(cardSource, /people-group/);
  assert.match(cardSource, /localizedAlumniDestination/);
  assert.match(cardSource, /<h3>\{name\}<\/h3>/);
  assert.match(yearInputSource, /const label = "入学年份"/);
  assert.match(yearInputSource, /onChange\(event\.currentTarget\.value \? set\(Number\(event\.currentTarget\.value\)\) : unset\(\)\)/);
});
