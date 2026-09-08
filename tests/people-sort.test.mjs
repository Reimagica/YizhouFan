import assert from "node:assert/strict";
import test from "node:test";
import {sortPeople} from "../lib/people-sort.ts";

const people = [
  {id: "missing-b", name: "Zed", nameZh: "乙", memberRole: "master", order: 1},
  {id: "older-master", name: "Bravo", nameZh: "丁", memberRole: "master", enrollmentYear: 2023, order: 1},
  {id: "newer", name: "Alpha", nameZh: "甲", memberRole: "graduated", enrollmentYear: 2025, order: 100},
  {id: "older-phd", name: "Charlie", nameZh: "丙", memberRole: "phd", enrollmentYear: 2023, order: 999},
  {id: "missing-a", name: "Able", nameZh: "戊", memberRole: "phd", order: 999},
];

test("sorts members by year descending, then role priority, ignoring legacy manual order", () => {
  assert.deepEqual(sortPeople(people, "en").map((person) => person.id), [
    "newer",
    "older-phd",
    "older-master",
    "missing-a",
    "missing-b",
  ]);
});

test("uses postdoc, PhD, master's-to-PhD, master's, graduated, other order within one year", () => {
  const sameYear = [
    {id: "other", name: "F", nameZh: "己", memberRole: "other", enrollmentYear: 2026},
    {id: "graduated", name: "A", nameZh: "甲", memberRole: "graduated", enrollmentYear: 2026},
    {id: "master", name: "B", nameZh: "乙", memberRole: "master", enrollmentYear: 2026},
    {id: "master-to-phd", name: "C", nameZh: "丙", memberRole: "masterToPhd", enrollmentYear: 2026},
    {id: "phd", name: "D", nameZh: "丁", memberRole: "phd", enrollmentYear: 2026},
    {id: "postdoc", name: "E", nameZh: "戊", memberRole: "postdoc", enrollmentYear: 2026},
  ];
  assert.deepEqual(sortPeople(sameYear, "zh").map((person) => person.id), [
    "postdoc",
    "phd",
    "master-to-phd",
    "master",
    "graduated",
    "other",
  ]);
});

test("infers legacy role text until Sanity memberRole values are backfilled", () => {
  const legacy = [
    {id: "master", name: "A", nameZh: "甲", positionZh: "硕士研究生", enrollmentYear: 2025},
    {id: "graduated", name: "B", nameZh: "乙", positionZh: "毕业生 · 香港大学博士研究生", enrollmentYear: 2025},
    {id: "phd", name: "C", nameZh: "丙", position: "Ph.D. student", enrollmentYear: 2025},
    {id: "postdoc", name: "D", nameZh: "丁", positionZh: "博雅博士后", enrollmentYear: 2025},
  ];
  assert.deepEqual(sortPeople(legacy, "zh").map((person) => person.id), ["postdoc", "phd", "master", "graduated"]);
});

test("uses the active-language name as the final stable tie-breaker", () => {
  const sameYear = [
    {id: "a", name: "Zulu", nameZh: "阿", memberRole: "master", enrollmentYear: 2024},
    {id: "b", name: "Alpha", nameZh: "周", memberRole: "master", enrollmentYear: 2024},
  ];
  assert.deepEqual(sortPeople(sameYear, "en").map((person) => person.id), ["b", "a"]);
  assert.deepEqual(sortPeople(sameYear, "zh").map((person) => person.id), ["a", "b"]);
});

test("does not mutate the source array", () => {
  const source = [...people];
  sortPeople(source, "en");
  assert.deepEqual(source, people);
});
