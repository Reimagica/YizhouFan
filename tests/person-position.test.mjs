import assert from "node:assert/strict";
import {test} from "node:test";
import {localizedPersonPosition} from "../lib/person-position.ts";

test("prefixes public positions with the enrollment cohort in both languages", () => {
  const person = {
    id: "person-1",
    name: "Example",
    nameZh: "示例",
    enrollmentYear: 2025,
    position: "Master’s student",
    positionZh: "硕士研究生",
  };

  assert.equal(localizedPersonPosition(person, "zh"), "2025级硕士研究生");
  assert.equal(localizedPersonPosition(person, "en"), "2025 cohort · Master’s student");
});

test("does not add enrollment cohorts to graduated or other roles", () => {
  const person = {
    id: "person-2",
    name: "Example",
    nameZh: "示例",
    enrollmentYear: 2023,
    position: "2023 cohort · Alumnus · Ph.D. student at HKU",
    positionZh: "北京大学教育学院2026届硕士毕业生 · 香港大学教育学院2026级博士生",
    memberRole: "graduated",
  };

  assert.equal(localizedPersonPosition(person, "zh"), person.positionZh);
  assert.equal(localizedPersonPosition(person, "en"), person.position);

  const other = {...person, memberRole: "other", position: "Visiting student", positionZh: "访问学生"};
  assert.equal(localizedPersonPosition(other, "zh"), "访问学生");
  assert.equal(localizedPersonPosition(other, "en"), "Visiting student");
});
