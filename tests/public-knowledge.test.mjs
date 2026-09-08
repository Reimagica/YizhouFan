import assert from "node:assert/strict";
import test from "node:test";
import {buildPublicKnowledgeText, PUBLIC_KNOWLEDGE_MAX_CHARS, selectRelevantPublications} from "../lib/server/knowledge-retrieval.ts";

const profile = {
  name: "Yizhou Fan",
  role: "Assistant Professor",
  affiliation: "Peking University",
  email: "fyz@pku.edu.cn",
  bio: ["Current public biography."],
  researchStatement: "Current research statement.",
  researchInterests: ["Learning Analytics", "Human-AI Collaboration"],
  appointments: [{year: "2025-present", institution: "Peking University", role: "Deputy Director"}],
  honors: [{year: "2026", title: "Public award"}],
  publicProjects: [{year: "2025-2027", title: "Publicly confirmed project"}],
  scholarMetrics: {citations: 4000, hIndex: 30, i10Index: 46, asOf: "2026-09-01"},
  academicService: "Current academic service.",
};

const courses = [{
  id: "course-1",
  title: "Learning Analytics",
  titleZh: "学习分析",
  nature: "Postgraduate course",
  natureZh: "研究生课程",
  description: "Current course description.",
  descriptionZh: "最新课程简介。",
  role: "Course coordinator",
  roleZh: "课程负责人",
  offeredSince: "2023",
  order: 1,
}];

const talks = [{
  id: "talk-1",
  date: "2026.07",
  title: "Human-AI Learning",
  titleZh: "人机协同学习",
  host: "Public host",
  hostZh: "公开主办方",
  summary: "Current talk summary.",
  summaryZh: "最新报告简介。",
}];

const people = [{
  id: "person-1",
  name: "Student One",
  nameZh: "成员一",
  position: "Ph.D. student",
  positionZh: "博士研究生",
  enrollmentYear: 2025,
  bio: "Current member biography.",
  bioZh: "最新成员简介。",
}];

const publications = [
  {
    id: "publication-metacognition",
    year: 2025,
    kind: "Journal article",
    title: "Metacognitive Scaffolding with Generative AI",
    titleZh: "生成式人工智能元认知脚手架",
    authors: "Yizhou Fan",
    venue: "Journal A",
    keywords: ["generative AI", "metacognition"],
    abstract: "This study evaluates metacognitive scaffolding during learning with generative artificial intelligence.",
    abstractZh: "本研究考察生成式人工智能学习中的元认知脚手架。",
  },
  {
    id: "publication-mooc",
    year: 2024,
    kind: "Journal article",
    title: "Repeated Registration in MOOCs",
    titleZh: "MOOC重复注册行为",
    authors: "Yizhou Fan",
    venue: "Journal B",
    keywords: ["MOOC"],
    abstract: "This study examines repeated course registration.",
    abstractZh: "本研究分析课程重复注册。",
  },
];

function knowledge(overrides = {}) {
  return buildPublicKnowledgeText({
    lang: "en",
    question: "Which publications discuss generative AI and metacognition?",
    profile,
    publications,
    talks,
    people,
    courses,
    ...overrides,
  });
}

test("selects publications using titles, keywords, and abstracts", () => {
  const selected = selectRelevantPublications(publications, "有哪些生成式AI与元认知相关的研究成果？");
  assert.deepEqual(selected.map((item) => item.id), ["publication-metacognition"]);
  assert.deepEqual(selectRelevantPublications(publications, "团队成员有哪些？"), []);
});

test("includes profile, course, talk, people, abstract, and keyword fields", () => {
  const text = knowledge();
  for (const expected of [
    "Biography: Current public biography.",
    "Appointment: 2025-present; Peking University; Deputy Director",
    "Academic service: Current academic service.",
    "Teaching role: Course coordinator",
    "Offered since: 2023",
    "Summary: Current talk summary.",
    "Student One",
    "Keywords=generative AI, metacognition",
    "Abstract=This study evaluates metacognitive scaffolding",
  ]) assert.match(text, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
  assert.doesNotMatch(text, /Repeated Registration in MOOCs/u);
});

test("uses localized Chinese fields for core sections and selected publications", () => {
  const text = knowledge({lang: "zh", question: "有哪些生成式AI与元认知相关的论文？"});
  for (const expected of ["课程负责人", "开设时间: 2023", "最新报告简介", "最新成员简介", "生成式人工智能元认知脚手架", "本研究考察生成式人工智能学习中的元认知脚手架"]) {
    assert.match(text, new RegExp(expected, "u"));
  }
});

test("keeps every core section inside the hard context limit", () => {
  const veryLong = "Long public text. ".repeat(4000);
  const text = knowledge({
    profile: {...profile, bio: [veryLong], researchStatement: veryLong, academicService: veryLong},
    courses: Array.from({length: 5}, (_, index) => ({...courses[0], id: `course-${index}`, title: `Course ${index}`, description: veryLong})),
    talks: Array.from({length: 11}, (_, index) => ({...talks[0], id: `talk-${index}`, title: `Talk ${index}`, summary: veryLong})),
    people: Array.from({length: 9}, (_, index) => ({...people[0], id: `person-${index}`, name: `Person ${index}`, bio: veryLong})),
    publications: Array.from({length: 92}, (_, index) => ({
      ...publications[0],
      id: `publication-${index}`,
      title: `Generative AI publication ${index}`,
      abstract: veryLong,
    })),
  });
  assert.ok(text.length <= PUBLIC_KNOWLEDGE_MAX_CHARS);
  for (const heading of ["PUBLIC PROFILE", "TEACHING", "HONORS AND AWARDS", "RESEARCH PROJECTS", "RESEARCH GROUP OVERVIEW", "TALKS", "PEOPLE", "PUBLICATIONS"]) {
    assert.match(text, new RegExp(heading, "u"));
  }
  assert.match(text, /Course 4/u);
  assert.match(text, /Talk 10/u);
  assert.match(text, /Person 8/u);
});

test("limits a generic publication request to ten works", () => {
  const many = Array.from({length: 30}, (_, index) => ({...publications[0], id: `publication-${index}`, title: `Publication ${index}`, year: 2026 - index}));
  assert.equal(selectRelevantPublications(many, "Please list representative publications.").length, 10);
});
