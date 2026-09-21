import assert from "node:assert/strict";
import test from "node:test";
import {groupPeople, personCategory, sortPeople, sortPeopleInCategory} from "../lib/people-sort.ts";

const people = [
  {id: "master-older", name: "Bravo", nameZh: "丁", memberCategory: "master", enrollmentYear: 2023},
  {id: "alumni", name: "Alpha", nameZh: "甲", memberCategory: "alumni", enrollmentYear: 2022},
  {id: "phd", name: "Charlie", nameZh: "丙", memberCategory: "phd", enrollmentYear: 2024},
  {id: "postdoc", name: "Delta", nameZh: "戊", memberCategory: "postdoc", enrollmentYear: 2026},
];

test("groups members into the five requested sections in a fixed order", () => {
  const groups = groupPeople(people, "zh");
  assert.deepEqual(groups.map((group) => group.category), ["postdoc", "phd", "master", "visiting", "alumni"]);
  assert.deepEqual(groups.map((group) => group.label), ["博士后", "博士研究生", "硕士研究生", "访问学者", "毕业生"]);
  assert.deepEqual(groups.map((group) => group.people.map((person) => person.id)), [
    ["postdoc"],
    ["phd"],
    ["master-older"],
    [],
    ["alumni"],
  ]);
});

test("sorts each category by year descending and then by the active-language name", () => {
  const sameCategory = [
    {id: "older", name: "Able", nameZh: "周", memberCategory: "master", enrollmentYear: 2024},
    {id: "zulu", name: "Zulu", nameZh: "阿", memberCategory: "master", enrollmentYear: 2025},
    {id: "alpha", name: "Alpha", nameZh: "乙", memberCategory: "master", enrollmentYear: 2025},
  ];
  assert.deepEqual(sortPeopleInCategory(sameCategory, "en").map((person) => person.id), ["alpha", "zulu", "older"]);
  assert.deepEqual(sortPeopleInCategory(sameCategory, "zh").map((person) => person.id), ["zulu", "alpha", "older"]);
});

test("uses enrollment year when sorting alumni", () => {
  const alumni = [
    {id: "2023", name: "A", nameZh: "甲", memberCategory: "alumni", enrollmentYear: 2023},
    {id: "2024", name: "B", nameZh: "乙", memberCategory: "alumni", enrollmentYear: 2024},
  ];
  assert.deepEqual(sortPeopleInCategory(alumni, "zh").map((person) => person.id), ["2024", "2023"]);
});

test("maps legacy Sanity roles during the migration window", () => {
  assert.equal(personCategory({id: "a", name: "A", nameZh: "甲", memberRole: "postdoc"}), "postdoc");
  assert.equal(personCategory({id: "b", name: "B", nameZh: "乙", memberRole: "masterToPhd"}), "phd");
  assert.equal(personCategory({id: "c", name: "C", nameZh: "丙", memberRole: "other"}), "visiting");
  assert.equal(personCategory({id: "d", name: "D", nameZh: "丁", memberRole: "graduated"}), "alumni");
});

test("flattens groups without mutating the source array", () => {
  const source = [...people];
  assert.deepEqual(sortPeople(source, "en").map((person) => person.id), ["postdoc", "phd", "master-older", "alumni"]);
  assert.deepEqual(source, people);
});
