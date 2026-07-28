import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {spawn} from "node:child_process";

const port = 3217;
const baseUrl = `http://127.0.0.1:${port}`;
let server;

before(async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: new URL("..", import.meta.url),
    env: {...process.env, DEEPSEEK_API_KEY: ""},
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/en`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Next.js test server did not start");
});

after(() => server?.kill("SIGTERM"));

async function request(pathname, init) {
  return fetch(`${baseUrl}${pathname}`, init);
}

test("uses the English profile as the default language landing page", async () => {
  const response = await request("/en");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Biography/);
  assert.match(html, /Courses taught/);
  assert.match(html, /Best Student Paper Nomination/);
  assert.match(html, /Peking University postgraduate course/);
  assert.match(html, /fyz@pku.edu.cn/);
  assert.doesNotMatch(html, /National Excellent MOOC Award|Excellent Doctoral Dissertation Award|National Scholarship for Graduate Students|Beijing Public Welfare Pioneer/);
  assert.doesNotMatch(html, /Selected work|codex-preview|react-loading-skeleton/i);
});

test("uses the Chinese profile as the Chinese landing page", async () => {
  const response = await request("/zh");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /个人简介/);
  assert.match(html, /开设课程/);
  assert.match(html, /最佳学生论文提名/);
  assert.doesNotMatch(html, /国家级精品在线开放课程，教育部|全国教育实证研究优秀学位论文奖|研究生国家奖学金|北京公益先锋/);
  assert.doesNotMatch(html, /公开白名单|仅展示已通过/);
  assert.match(html, /AI 问答/);
});

test("renders searchable publication controls and PDF status", async () => {
  const response = await request("/en/publications");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Enter a title, author, venue, or keyword/);
  assert.match(html, /View source/);
  assert.match(html, /10\.1111\/bjet\.13544/);
  assert.doesNotMatch(html, /Find source|google\.com\/scholar\?q=/i);
  assert.match(html, /PDF pending/);
  assert.match(html, /BibTeX/);
});

test("places the talk search before filters and results", async () => {
  const response = await request("/en/talks");
  assert.equal(response.status, 200);
  const html = await response.text();
  const searchIndex = html.indexOf("Enter a title, host, or talk type");
  const yearIndex = html.indexOf(">Year<");
  assert.ok(searchIndex >= 0);
  assert.ok(yearIndex > searchIndex);
});

test("renders three static people categories", async () => {
  const response = await request("/en/people");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Postdoctoral fellows/);
  assert.match(html, /Current students/);
  assert.match(html, /Alumni/);
});

test("renders the live AI Q&A surface and fails safely without a key", async () => {
  const page = await request("/en/ask");
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Ask the AI assistant/);
  assert.match(html, /This browser may ask up to 8 questions per day/);
  assert.doesNotMatch(html, /Each visitor may ask/);

  const api = await request("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: "What does Dr. Fan research?", lang: "en" }),
  });
  assert.equal(api.status, 503);
  assert.match(await api.text(), /model key has not been configured/i);
});

test("rejects unsigned CMS automation requests", async () => {
  const response = await request("/api/cms/automation", {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify({operation: "publication.lookup"}),
  });
  assert.equal(response.status, 401);
});
