import assert from "node:assert/strict";
import {test} from "node:test";
import {localizedAlumniDestination, localizedPersonPosition} from "../lib/person-position.ts";

test("generates current-member status from category and enrollment year", () => {
  const base = {id: "person-1", name: "Example", nameZh: "示例", enrollmentYear: 2025};
  assert.equal(localizedPersonPosition({...base, memberCategory: "postdoc"}, "zh"), "2025级博士后");
  assert.equal(localizedPersonPosition({...base, memberCategory: "phd"}, "en"), "2025 cohort · Ph.D. student");
  assert.equal(localizedPersonPosition({...base, memberCategory: "master"}, "zh"), "2025级硕士研究生");
  assert.equal(localizedPersonPosition({...base, memberCategory: "visiting"}, "en"), "2025 cohort · Visiting Scholar");
});

test("generates alumni status and exposes the bilingual destination separately", () => {
  const person = {
    id: "person-2",
    name: "Example",
    nameZh: "示例",
    memberCategory: "alumni",
    enrollmentYear: 2021,
    alumniIdentity: "phd",
    destination: "University A",
    destinationZh: "甲大学",
  };
  assert.equal(localizedPersonPosition(person, "zh"), "2021级博士研究生");
  assert.equal(localizedPersonPosition(person, "en"), "2021 cohort · Ph.D. student");
  assert.equal(localizedAlumniDestination(person, "zh"), "甲大学");
  assert.equal(localizedAlumniDestination(person, "en"), "University A");
});

test("reads the confirmed alumni year, degree, and destination from legacy position text during migration", () => {
  const legacy = {
    id: "person-009",
    name: "Luzhen Tang",
    nameZh: "唐陆禛",
    memberRole: "graduated",
    enrollmentYear: 2023,
    position: "2026 Master’s Graduate, PKU GSE · 2026 Ph.D. Student, HKU Faculty of Education",
    positionZh: "北京大学教育学院2026届硕士毕业生 · 香港大学教育学院2026级博士生",
  };
  assert.equal(localizedPersonPosition(legacy, "zh"), "2023级硕士研究生");
  assert.equal(localizedPersonPosition(legacy, "en"), "2023 cohort · Master’s student");
  assert.equal(localizedAlumniDestination(legacy, "zh"), "香港大学教育学院2026级博士生");
  assert.equal(localizedAlumniDestination(legacy, "en"), "2026 Ph.D. Student, HKU Faculty of Education");
});
