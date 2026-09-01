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
  assert.match(html, /范逸洲/);
  assert.match(html, /Yizhou Fan/);
  assert.doesNotMatch(html, /Personal Website/);
  assert.match(html, /Academic profile/);
  assert.match(html, /Works on this site/);
  assert.match(html, /<strong>\d{1,3}(?:,\d{3})*<\/strong><span>Citations<\/span>/);
  assert.match(html, /Scholar metrics as of \d{4}-\d{2}-\d{2}/);
  assert.match(html, /h-index/);
  assert.match(html, /i10-index/);
  assert.match(html, />92</);
  assert.match(html, /Best Student Paper Nomination/);
  assert.match(html, /fyz@pku.edu.cn/);
  assert.doesNotMatch(html, /Courses taught/);
  assert.doesNotMatch(html, /Learning sciences · Analytics · Artificial intelligence/);
  assert.doesNotMatch(html, /National Excellent MOOC Award|Excellent Doctoral Dissertation Award|National Scholarship for Graduate Students|Beijing Public Welfare Pioneer/);
  assert.doesNotMatch(html, /Selected work|codex-preview|react-loading-skeleton/i);
  assert.doesNotMatch(html, /Studying how learners retain judgment, reflection, and agency in the age of AI/);
});

test("uses the Chinese profile as the Chinese landing page", async () => {
  const response = await request("/zh");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /个人简介/);
  assert.match(html, /范逸洲/);
  assert.doesNotMatch(html, /个人网站/);
  assert.match(html, /学术数据/);
  assert.match(html, /本站学术成果/);
  assert.match(html, /最佳学生论文提名/);
  assert.match(html, /基于生成式人工智能建构元认知脚手架的关键技术及实证应用研究/);
  assert.doesNotMatch(html, /开设课程/);
  assert.doesNotMatch(html, /国家级精品在线开放课程，教育部|全国教育实证研究优秀学位论文奖|研究生国家奖学金|北京公益先锋/);
  assert.doesNotMatch(html, /研究学习者如何在人工智能时代保持判断、反思与能动性|我的研究关注学习者如何在与人工智能互动中进行调节、理解与成长/);
  assert.doesNotMatch(html, /公开白名单|仅展示已通过/);
  assert.doesNotMatch(html, />0[1-7]</);
  assert.match(html, /至今/);
  assert.match(html, /AI 问答/);
});

test("renders the five-course bilingual teaching archive", async () => {
  const english = await request("/en/teaching");
  assert.equal(english.status, 200);
  const englishHtml = await english.text();
  assert.match(englishHtml, /Courses/);
  assert.match(englishHtml, /Learning Analytics/);
  assert.match(englishHtml, /Information Technology and Higher Education Management/);
  assert.match(englishHtml, /English Academic Writing in the Age of AI/);
  assert.match(englishHtml, /Human-Computer Interaction Design/);
  assert.match(englishHtml, /AI Literacy for Academic Purposes/);
  assert.match(englishHtml, /authentic multimodal learning data/);
  assert.match(englishHtml, /institutional decision-making and governance/);
  assert.match(englishHtml, /academic integrity or authorial control/);
  assert.match(englishHtml, /View the companion MOOC/);
  assert.doesNotMatch(englishHtml, /Find related courses on China University MOOC/);
  assert.doesNotMatch(englishHtml, /Academic Writing in English|Peer Instruction|Flipped Classroom Pedagogy/);

  const chinese = await request("/zh/teaching");
  assert.equal(chinese.status, 200);
  const chineseHtml = await chinese.text();
  assert.match(chineseHtml, /学习分析/);
  assert.match(chineseHtml, /信息技术与高校管理/);
  assert.match(chineseHtml, /智能时代的英文学术写作/);
  assert.match(chineseHtml, /人机交互设计/);
  assert.match(chineseHtml, /面向学术的 AI 素养/);
  assert.match(chineseHtml, /访问配套 MOOC/);
  assert.doesNotMatch(chineseHtml, /在中国大学 MOOC 检索相关课程/);
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

test("localizes publication types and exposes filter state in Chinese", async () => {
  const response = await request("/zh/publications");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /期刊论文|会议论文|学术著作/);
  assert.match(html, /aria-pressed="true"/);
});

test("places the talk search before filters and results and drops the type filter", async () => {
  const response = await request("/en/talks");
  assert.equal(response.status, 200);
  const html = await response.text();
  const searchIndex = html.indexOf("Enter a title or host");
  const yearIndex = html.indexOf(">Year<");
  assert.ok(searchIndex >= 0);
  assert.ok(yearIndex > searchIndex);
  assert.match(html, /<h1>Talks<\/h1>/);
  assert.match(html, /Search talks by title, host, or year\./);
  // Type filter UI removed entirely.
  assert.doesNotMatch(html, />Type</);
  assert.doesNotMatch(html, /talk type/i);
  assert.doesNotMatch(html, /shared decks|downloadable materials|slide decks/i);
});

test("renders 11 talks in whitelist order without type labels (en)", async () => {
  const response = await request("/en/talks");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /11 talks/);
  assert.doesNotMatch(html, /Keynote|Invited talk|主旨演讲|受邀报告/);
  const expectedTitles = [
    "A Metacognitive Approach to Learning and Performance in Human-AI Interaction",
    "Shifting From Product-Oriented to Process-Oriented Assessment with Learning Analytics",
    "Beware of Metacognitive Laziness in Learning with GenAI",
    "Revealing and Avoiding Metacognitive Laziness while Learning with GenAI",
    "Learning with GenAI to solve real-world and high-challenge tasks",
    "Designing, scaffolding, and coding complex human-AI interactions and collaboration processes",
    "Learning with GenAI: Beware the Trap of Metacognitive Laziness",
    "Beware of Metacognitive Laziness in Learning with GenAI",
    "Learning and Regulating with ChatGPT: What Experimental Study Tells Us?",
    "When and why learners benefit from personalized scaffoldings for self-regulated learning",
    "Improving the measurement of selfregulated learning using multichannel data: A FLoRA Case Study",
  ];
  let previousIndex = -1;
  for (const title of expectedTitles) {
    const index = html.indexOf(title, previousIndex + 1);
    assert.ok(index > previousIndex, `missing or out-of-order talk: ${title}`);
    previousIndex = index;
  }
  assert.doesNotMatch(html, /href="\/en\/talks\//);
});

test("renders talks in Chinese without type classification labels", async () => {
  const response = await request("/zh/talks");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /11 场报告/);
  assert.match(html, /<h1>学术报告<\/h1>/);
  assert.match(html, /可按题目、主办方或年份检索学术报告。/);
  assert.doesNotMatch(html, /主旨演讲|受邀报告/);
  assert.doesNotMatch(html, /可下载课件|公开课件/);
  assert.match(html, /aria-pressed="true"/);
});

test("renders a public talk detail route without cover, type pill, or fake content", async () => {
  const response = await request("/en/talks/talk-2026-07-bavaria");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Back to talks/);
  assert.doesNotMatch(html, /cover image/i);
  assert.doesNotMatch(html, /Keynote|Invited talk|主旨演讲|受邀报告/);
  // No fabricated downloads/attachments when the talk has none.
  assert.doesNotMatch(html, /Public downloads|公开附件/);
  assert.doesNotMatch(html, /Download attachment|下载报告附件/);
});

test("keeps publications and talks as one record per work with locale fallback", async () => {
  const englishPublications = await request("/en/publications");
  const publicationHtml = await englishPublications.text();
  assert.match(publicationHtml, /他们为什么回来？——MOOCs中重复注册者行为与动机分析/);

  const chineseTalks = await request("/zh/talks");
  const talkHtml = await chineseTalks.text();
  assert.match(talkHtml, /A Metacognitive Approach to Learning and Performance in Human-AI Interaction/);
});

test("renders all members on one page without category tabs (en)", async () => {
  const response = await request("/en/people");
  assert.equal(response.status, 200);
  const html = await response.text();
  // Category tab UI removed entirely.
  assert.doesNotMatch(html, /people-tabs/);
  assert.doesNotMatch(html, /aria-pressed="true"/);
  assert.doesNotMatch(html, /Postdoctoral fellows|Current students/);
  // All members render on one page in a single grid.
  const cardCount = html.split('class="person-card"').length - 1;
  assert.equal(cardCount, 9);
  assert.doesNotMatch(html, /No public members/);
  assert.match(html, /Luzhen Tang/);
  assert.match(html, /Zijian Li/);
  assert.match(html, /Mingxue Xu/);
  assert.match(html, /Linfei Xiao/);
  assert.match(html, /Ling Ma/);
  assert.doesNotMatch(html, /Enrollment year forthcoming|Profile forthcoming/);
  // No member detail route / no clickable fake entry.
  assert.doesNotMatch(html, /href="\/en\/people\/[^"]+"/);
});

test("renders all completed member profiles in Chinese without tabs (zh)", async () => {
  const response = await request("/zh/people");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /people-tabs/);
  assert.doesNotMatch(html, /aria-pressed="true"/);
  const cardCount = html.split('class="person-card"').length - 1;
  assert.equal(cardCount, 9);
  assert.match(html, /唐陆禛/);
  assert.match(html, /李子健/);
  assert.match(html, /许明雪/);
  assert.match(html, /肖琳霏/);
  assert.match(html, /马玲/);
  assert.doesNotMatch(html, /入学年份待补充|个人与研究简介待补充/);
  assert.doesNotMatch(html, /href="\/zh\/people\/[^"]+"/);
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

test("protects the academic lookup endpoint by Studio origin", async () => {
  const forbidden = await request("/api/cms/publications/lookup?title=Learning");
  assert.equal(forbidden.status, 403);
  const invalid = await request("/api/cms/publications/lookup", {headers: {origin: "http://localhost:3333"}});
  assert.equal(invalid.status, 400);
});
