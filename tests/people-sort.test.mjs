import assert from "node:assert/strict";
import test from "node:test";
import {sortPeople} from "../lib/people-sort.ts";

const people = [
  {id: "missing-b", name: "Zed", nameZh: "乙", order: 1},
  {id: "older-b", name: "Bravo", nameZh: "丁", enrollmentYear: 2023, order: 20},
  {id: "newer", name: "Alpha", nameZh: "甲", enrollmentYear: 2025, order: 100},
  {id: "older-a", name: "Charlie", nameZh: "丙", enrollmentYear: 2023, order: 10},
  {id: "missing-a", name: "Able", nameZh: "戊", order: 999},
];

test("sorts members by year descending, then manual order, then display name", () => {
  assert.deepEqual(sortPeople(people, "en").map((person) => person.id), [
    "newer",
    "older-a",
    "older-b",
    "missing-a",
    "missing-b",
  ]);
});

test("uses the active-language name as the final stable tie-breaker", () => {
  const sameYear = [
    {id: "a", name: "Zulu", nameZh: "阿", enrollmentYear: 2024, order: 10},
    {id: "b", name: "Alpha", nameZh: "周", enrollmentYear: 2024, order: 10},
  ];
  assert.deepEqual(sortPeople(sameYear, "en").map((person) => person.id), ["b", "a"]);
  assert.deepEqual(sortPeople(sameYear, "zh").map((person) => person.id), ["a", "b"]);
});

test("does not mutate the source array", () => {
  const source = [...people];
  sortPeople(source, "en");
  assert.deepEqual(source, people);
});
