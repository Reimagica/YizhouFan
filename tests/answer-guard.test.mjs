import assert from "node:assert/strict";
import test from "node:test";
import {guardAnswer} from "../lib/server/answer-guard.ts";
import {ensurePublicationTitles, selectPublicationLinks, selectPublicSources} from "../lib/server/answer-links.ts";

test("removes markdown and forced contact boilerplate", () => {
  const answer = guardAnswer(JSON.stringify({
    status: "answered",
    items: ["**研究方向**包括人工智能教育与学习分析。"],
    note: "更多详情可访问课题组相关公开页面或联系 fyz@pku.edu.cn。",
  }), "zh");

  assert.deepEqual(answer.items, ["研究方向包括人工智能教育与学习分析。"]);
  assert.equal(answer.note, undefined);
  assert.deepEqual(answer.topics, []);
  assert.deepEqual(answer.publicationIds, []);
  assert.doesNotMatch(JSON.stringify(answer), /\*\*/u);
});

test("enforces item count and bilingual length limits", () => {
  const chinese = guardAnswer(JSON.stringify({status: "answered", items: ["长".repeat(420)]}), "zh");
  assert.ok(Array.from(chinese.items[0]).length <= 300);

  const english = guardAnswer(JSON.stringify({
    status: "answered",
    items: Array.from({length: 7}, (_, index) => `${index} ${"word ".repeat(180)}`),
  }), "en");
  assert.equal(english.items.length, 4);
  assert.ok(english.items.every((item) => item.split(/\s+/u).length <= 150));
});

test("falls back safely when the model does not return JSON", () => {
  const answer = guardAnswer("First supported point.\nSecond supported point.", "en");
  assert.equal(answer.status, "answered");
  assert.deepEqual(answer.items, ["First supported point.", "Second supported point."]);
});

test("keeps only supported topics and bounded publication IDs", () => {
  const answer = guardAnswer(JSON.stringify({
    status: "answered",
    items: ["A publication is relevant."],
    topics: ["publications", "private", "profile"],
    publicationIds: ["publication-1", "**publication-2**"],
  }), "en");
  assert.deepEqual(answer.topics, ["publications", "profile"]);
  assert.deepEqual(answer.publicationIds, ["publication-1", "publication-2"]);
});

test("uses only verified publication URLs from site data", () => {
  const publications = [{
    id: "publication-1",
    year: 2025,
    kind: "Journal article",
    title: "Verified article",
    titleZh: "已核实论文",
    authors: "Yizhou Fan",
    venue: "Journal",
    sourceUrl: "https://doi.org/10.1234/verified",
  }];
  const links = selectPublicationLinks(publications, ["publication-1", "invented-id"], "A cited article", "Question", "zh");
  assert.deepEqual(links, [{label: "已核实论文", url: "https://doi.org/10.1234/verified"}]);
  assert.deepEqual(ensurePublicationTitles(["这项研究讨论了学习过程。"], publications, ["publication-1"], "zh"), ["《已核实论文》：这项研究讨论了学习过程。"]);
});

test("falls back to a public PDF URL when no source or DOI is available", () => {
  const publications = [{
    id: "publication-2",
    year: 2024,
    kind: "Journal article",
    title: "PDF-only paper",
    titleZh: "仅 PDF 论文",
    authors: "Yizhou Fan",
    venue: "Journal",
    pdfUrl: "https://cdn.sanity.io/files/mb3w1o0y/production/pdf-only.pdf",
  }];
  const links = selectPublicationLinks(publications, ["publication-2"], "Discussing the PDF-only paper", "Question", "en");
  assert.deepEqual(links, [{label: "PDF-only paper", url: "https://cdn.sanity.io/files/mb3w1o0y/production/pdf-only.pdf"}]);
});

test("returns relevant internal section links", () => {
  assert.deepEqual(selectPublicSources("请介绍论文和报告", "zh", ["publications", "talks"]), [
    {label: "学术成果", url: "/zh/publications"},
    {label: "学术报告", url: "/zh/talks"},
  ]);
  assert.deepEqual(selectPublicSources("请介绍学习分析课程", "zh", ["teaching"]), [
    {label: "教学", url: "/zh/teaching"},
  ]);
});
