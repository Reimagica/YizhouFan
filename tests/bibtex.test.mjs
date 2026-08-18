import assert from "node:assert/strict";
import test from "node:test";
import {publicationToBibTeX} from "../lib/bibtex.ts";

test("emits an @article with journal, volume, number, pages and doi for a journal article", () => {
  const out = publicationToBibTeX({
    id: "p1",
    year: 2025,
    kind: "Journal article",
    title: "Beware of metacognitive laziness",
    authors: "Yizhou Fan, L. Tang",
    venue: "British Journal of Educational Technology",
    volume: "56",
    issue: "2",
    pages: "489-530",
    doi: "10.1111/bjet.13544",
  });
  assert.match(out, /@article\{Fan2025/u);
  assert.match(out, /journal = \{British Journal of Educational Technology\}/u);
  assert.match(out, /volume = \{56\}/u);
  assert.match(out, /number = \{2\}/u);
  assert.match(out, /pages = \{489-530\}/u);
  assert.match(out, /doi = \{10\.1111\/bjet\.13544\}/u);
  assert.match(out, /year = \{2025\}/u);
  assert.doesNotMatch(out, /articleno/u);
});

test("outputs articleno when an article number is present (without pages)", () => {
  const out = publicationToBibTeX({
    id: "p2",
    year: 2026,
    kind: "Journal article",
    title: "FLoRA",
    authors: "X. Li, Yizhou Fan",
    venue: "Computers & Education",
    volume: "243",
    articleNumber: "105527",
  });
  assert.match(out, /volume = \{243\}/u);
  assert.match(out, /articleno = \{105527\}/u);
  assert.doesNotMatch(out, /pages =/u);
  assert.doesNotMatch(out, /number =/u);
});

test("outputs both pages and articleno when both are present", () => {
  const out = publicationToBibTeX({
    id: "p2b",
    year: 2025,
    kind: "Journal article",
    title: "Asking generative AI the right questions",
    authors: "Yizhou Fan, L. Tang",
    venue: "Computers and Education: Artificial Intelligence",
    volume: "8",
    articleNumber: "100374",
    pages: "100374",
  });
  assert.match(out, /articleno = \{100374\}/u);
  assert.match(out, /pages = \{100374\}/u);
});

test("emits @incollection with booktitle for a book chapter", () => {
  const out = publicationToBibTeX({
    id: "p2c",
    year: 2026,
    kind: "Book chapter",
    title: "A chapter on learning analytics",
    authors: "Yizhou Fan, D. Gašević",
    venue: "Handbook of Learning Analytics",
    publisher: "Springer",
    pages: "1-15",
    doi: "10.1007/978-3-031-98462-4_37",
  });
  assert.match(out, /@incollection\{Fan2026/u);
  assert.match(out, /booktitle = \{Handbook of Learning Analytics\}/u);
  assert.match(out, /pages = \{1-15\}/u);
  assert.match(out, /doi = \{10\.1007\/978-3-031-98462-4_37\}/u);
  assert.doesNotMatch(out, /journal =|publisher =/u);
});

test("emits @book with publisher and no journal/booktitle for a book", () => {
  const out = publicationToBibTeX({
    id: "p3",
    year: 2024,
    kind: "Book",
    title: "English Academic Writing in Practice",
    authors: "Yizhou Fan, T. Juelich, J. Mao",
    venue: "Tsinghua University Press",
  });
  assert.match(out, /@book\{Fan2024/u);
  assert.match(out, /publisher = \{Tsinghua University Press\}/u);
  assert.doesNotMatch(out, /journal =|booktitle =/u);
});

test("emits @inproceedings with booktitle for a conference paper", () => {
  const out = publicationToBibTeX({
    id: "p4",
    year: 2026,
    kind: "Conference paper",
    title: "When LLMs fall short in deductive coding",
    authors: "Z. Li, L. Tang, Yizhou Fan",
    venue: "LAK 2026",
    pages: "685-696",
  });
  assert.match(out, /@inproceedings\{Fan2026/u);
  assert.match(out, /booktitle = \{LAK 2026\}/u);
  assert.match(out, /pages = \{685-696\}/u);
  assert.doesNotMatch(out, /journal =|publisher =/u);
});

test("prefers an explicit bibtex field over generated output", () => {
  const out = publicationToBibTeX({
    id: "p5",
    year: 2023,
    kind: "Journal article",
    title: "X",
    authors: "Y",
    venue: "Z",
    bibtex: "@article{Custom2023,\n  title = {X},\n}",
  });
  assert.equal(out, "@article{Custom2023,\n  title = {X},\n}");
});

test("separates comma-separated authors with BibTeX 'and'", () => {
  const out = publicationToBibTeX({
    id: "p6",
    year: 2025,
    kind: "Journal article",
    title: "T",
    authors: "Yizhou Fan, L. Tang, D. Gašević",
    venue: "V",
  });
  assert.match(out, /author = \{Yizhou Fan and L\. Tang and D\. Gašević\}/u);
});
