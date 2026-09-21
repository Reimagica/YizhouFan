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

function decodeHtml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function htmlTags(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function tagAttributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((match) => [match[1].toLowerCase(), decodeHtml(match[2])]));
}

function metadataContent(html, selector, value) {
  const tag = htmlTags(html, "meta").find((item) => tagAttributes(item)[selector] === value);
  return tag ? tagAttributes(tag).content : undefined;
}

test("uses the English profile as the default language landing page", async () => {
  const response = await request("/en");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Biography/);
  assert.match(html, /Yizhou Fan/);
  assert.match(html, /<html lang="en">/);
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

test("publishes unique bilingual titles, descriptions, canonicals, and one H1 per main page", async () => {
  const pages = [
    ["/en", "Yizhou Fan | Peking University", "Academic profile of Yizhou Fan at Peking University, covering his biography, research interests, appointments, honors, public projects, and academic service."],
    ["/zh", "范逸洲｜北京大学教育学院", "范逸洲的个人学术主页，介绍其在北京大学教育学院的任职、研究方向、学术经历、荣誉、公开科研项目与学术服务。"],
    ["/en/publications", "Publications & Open PDFs | Yizhou Fan", "Search Yizhou Fan’s publications and books, read abstracts and citation details, copy BibTeX, and download copyright-cleared PDFs."],
    ["/zh/publications", "范逸洲学术成果与公开 PDF", "检索范逸洲的论文与著作，查看摘要和引文信息、复制 BibTeX，并下载已确认可公开的 PDF 全文。"],
    ["/en/talks", "Academic Talks | Yizhou Fan", "Browse Yizhou Fan’s academic talks by title, host, or year and access verified public presentation materials when available."],
    ["/zh/talks", "范逸洲学术报告", "按题目、主办方或年份浏览范逸洲的学术报告，并在材料获准公开时直接获取报告附件。"],
    ["/en/teaching", "Teaching & Courses | Yizhou Fan", "Explore Yizhou Fan’s six courses at Peking University, including learning analytics, academic writing, HCI, AI literacy, and peer instruction."],
    ["/zh/teaching", "范逸洲教授课程", "了解范逸洲在北京大学开设的六门课程，涵盖学习分析、英文学术写作、人机交互、AI 素养与同伴教学法等主题。"],
    ["/en/people", "Research Team | Yizhou Fan", "Meet the postdoctoral fellows, Ph.D. students, master’s students, visiting scholars, and alumni in Yizhou Fan’s research team."],
    ["/zh/people", "范逸洲研究团队成员", "查看范逸洲研究团队的博士后、博士研究生、硕士研究生、访问学者与毕业生信息。"],
  ];
  const titles = new Set();

  for (const [pathname, expectedTitle, expectedDescription] of pages) {
    const response = await request(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    assert.equal(decodeHtml(titleMatch?.[1]), expectedTitle, `${pathname} title`);
    assert.equal(metadataContent(html, "name", "description"), expectedDescription, `${pathname} description`);
    assert.equal(metadataContent(html, "property", "og:title"), expectedTitle, `${pathname} Open Graph title`);
    assert.equal(metadataContent(html, "name", "twitter:title"), expectedTitle, `${pathname} Twitter title`);

    const canonical = htmlTags(html, "link").map(tagAttributes).find((attributes) => attributes.rel === "canonical");
    assert.equal(canonical?.href, `https://yizhoufan.com${pathname}`, `${pathname} canonical`);

    const alternates = htmlTags(html, "link").map(tagAttributes).filter((attributes) => attributes.rel === "alternate");
    const englishPath = pathname.replace(/^\/zh/, "/en");
    const chinesePath = pathname.replace(/^\/en/, "/zh");
    assert.ok(alternates.some((attributes) => attributes.hreflang === "en" && attributes.href === `https://yizhoufan.com${englishPath}`));
    assert.ok(alternates.some((attributes) => attributes.hreflang === "zh" && attributes.href === `https://yizhoufan.com${chinesePath}`));
    assert.ok(alternates.some((attributes) => attributes.hreflang === "x-default" && attributes.href === `https://yizhoufan.com${englishPath}`));

    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${pathname} should have one H1`);
    titles.add(expectedTitle);
  }

  assert.equal(titles.size, pages.length, "main-page titles should be unique");
});

test("adds verified ProfilePage and Person structured data without changing visible copy", async () => {
  const response = await request("/en");
  const html = await response.text();
  const jsonLdTag = htmlTags(html, "script").find((tag) => tagAttributes(tag).type === "application/ld+json");
  assert.ok(jsonLdTag);
  const jsonText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const data = JSON.parse(jsonText);

  assert.equal(data["@type"], "ProfilePage");
  assert.equal(data.url, "https://yizhoufan.com/en");
  assert.equal(data.mainEntity["@type"], "Person");
  assert.equal(data.mainEntity.name, "Yizhou Fan");
  assert.equal(data.mainEntity.alternateName, "范逸洲");
  assert.equal(data.mainEntity.image, "https://yizhoufan.com/yizhou-fan.jpg");
  assert.ok(data.mainEntity.sameAs.includes("https://orcid.org/0000-0003-2777-1705"));
  assert.ok(data.mainEntity.sameAs.some((url) => url.includes("scholar.google.com/citations")));
  assert.ok(data.mainEntity.knowsAbout.includes("Learning Analytics"));
});

test("keeps real image alternatives and crawlable internal navigation", async () => {
  for (const pathname of ["/en", "/zh", "/en/people", "/zh/people"]) {
    const html = await (await request(pathname)).text();
    const images = htmlTags(html, "img").map(tagAttributes);
    assert.ok(images.length > 0, `${pathname} should render images`);
    assert.ok(images.every((attributes) => attributes.alt?.trim()), `${pathname} images should have non-empty alt text`);
  }

  const home = await (await request("/en")).text();
  for (const path of ["/en/publications", "/en/talks", "/en/teaching", "/en/people", "/en/ask"]) {
    assert.ok(htmlTags(home, "a").map(tagAttributes).some((attributes) => attributes.href === path), `missing internal link ${path}`);
  }
});

test("keeps AI Q&A out of search indexes while allowing link discovery", async () => {
  const english = await (await request("/en/ask")).text();
  const chinese = await (await request("/zh/ask")).text();
  assert.match(metadataContent(english, "name", "robots"), /noindex/i);
  assert.match(metadataContent(english, "name", "robots"), /follow/i);
  assert.match(metadataContent(chinese, "name", "robots"), /noindex/i);
  assert.equal((english.match(/<h1\b/gi) ?? []).length, 1);
  assert.equal((chinese.match(/<h1\b/gi) ?? []).length, 1);
});

test("publishes a selective sitemap and blocks API crawling", async () => {
  const sitemapResponse = await request("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  assert.match(sitemap, /https:\/\/yizhoufan\.com\/en<\/loc>/);
  assert.match(sitemap, /https:\/\/yizhoufan\.com\/zh\/publications<\/loc>/);
  assert.match(sitemap, /hreflang="x-default"/);
  assert.doesNotMatch(sitemap, /\/ask<\/loc>/);
  assert.doesNotMatch(sitemap, /<lastmod>/);

  const robotsResponse = await request("/robots.txt");
  assert.equal(robotsResponse.status, 200);
  const robots = await robotsResponse.text();
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Sitemap: https:\/\/yizhoufan\.com\/sitemap\.xml/);
});

test("serves the Baidu site-verification file from the public root", async () => {
  const response = await request("/baidu_verify_codeva-MG05lBZzhr.html");
  assert.equal(response.status, 200);
  assert.equal((await response.text()).trim(), "d183a79a8d5d75b6c6f18edc0f188e31");
});

test("renders the six-course bilingual teaching archive", async () => {
  const english = await request("/en/teaching");
  assert.equal(english.status, 200);
  const englishHtml = await english.text();
  assert.match(englishHtml, /Courses/);
  assert.match(englishHtml, /Learning Analytics/);
  assert.match(englishHtml, /Information Technology and Higher Education Management/);
  assert.match(englishHtml, /English Academic Writing in the Age of AI/);
  assert.match(englishHtml, /Human-Computer Interaction Design/);
  assert.match(englishHtml, /AI Literacy for Academic Purposes/);
  assert.match(englishHtml, /Peer Instruction/);
  assert.match(englishHtml, /authentic multimodal learning data/);
  assert.match(englishHtml, /institutional decision-making and governance/);
  assert.match(englishHtml, /academic integrity or authorial control/);
  assert.match(englishHtml, /View course/);
  assert.match(englishHtml, /higher\.smartedu\.cn\/course\/68b75f4dd5f9b8b6cf9dd2c6/);
  assert.doesNotMatch(englishHtml, /Find related courses on China University MOOC/);
  assert.doesNotMatch(englishHtml, /Academic Writing in English|Flipped Classroom Pedagogy/);

  const chinese = await request("/zh/teaching");
  assert.equal(chinese.status, 200);
  const chineseHtml = await chinese.text();
  assert.match(chineseHtml, /学习分析/);
  assert.match(chineseHtml, /信息技术与高校管理/);
  assert.match(chineseHtml, /智能时代的英文学术写作/);
  assert.match(chineseHtml, /人机交互设计/);
  assert.match(chineseHtml, /面向学术的 AI 素养/);
  assert.match(chineseHtml, /同伴教学法/);
  assert.match(chineseHtml, /访问课程/);
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
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /Show \d+ more years/);
  assert.match(html, /featured-pill[^>]*>Featured</);
  const featuredIndex = html.indexOf("A Metacognitive Approach to Learning and Performance in Human-AI Interaction");
  const regularIndex = html.indexOf("Beyond the Chat Window");
  assert.ok(featuredIndex >= 0 && regularIndex > featuredIndex, "featured publications should render before regular publications");
  assert.doesNotMatch(html, /Search by title, author, venue, year/);
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
  assert.doesNotMatch(html, /Search talks by title, host, or year\./);
  assert.match(html, /talk-card__heading/);
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
  assert.doesNotMatch(html, /可按题目、主办方或年份检索学术报告。/);
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
  // Categories are stacked as sections rather than interactive tabs.
  assert.doesNotMatch(html, /people-tabs/);
  assert.doesNotMatch(html, /aria-pressed="true"/);
  for (const heading of ["Postdoctoral Fellows", "Ph.D. Students", "Master’s Students", "Visiting Scholars", "Alumni"]) {
    assert.match(html, new RegExp(heading.replace(".", "\\.")));
  }
  // All members render on one page across the section grids.
  const cardCount = html.split('class="person-card"').length - 1;
  assert.equal(cardCount, 11);
  assert.doesNotMatch(html, /No public members/);
  assert.match(html, /Luzhen Tang/);
  assert.match(html, /Zijian Li/);
  assert.match(html, /Mingxue Xu/);
  assert.match(html, /Linfei Xiao/);
  assert.match(html, /Ling Ma/);
  assert.match(html, /Boyu Shi/);
  assert.match(html, /Sophia Xu/);
  assert.match(html, /2026 cohort · Visiting Scholar/);
  assert.doesNotMatch(html, /Enrollment year forthcoming|Profile forthcoming/);
  assert.match(html, /2026 cohort · Ph\.D\. student/);
  assert.match(html, /2023 cohort · Master’s student/);
  assert.match(html, /Destination/);
  assert.match(html, /HKU Faculty of Education/);
  assert.doesNotMatch(html, /person-card__year/);
  // No member detail route / no clickable fake entry.
  assert.doesNotMatch(html, /href="\/en\/people\/[^"]+"/);
});

test("renders all completed member profiles in Chinese without tabs (zh)", async () => {
  const response = await request("/zh/people");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /people-tabs/);
  assert.doesNotMatch(html, /aria-pressed="true"/);
  for (const heading of ["博士后", "博士研究生", "硕士研究生", "访问学者", "毕业生"]) assert.match(html, new RegExp(heading));
  const cardCount = html.split('class="person-card"').length - 1;
  assert.equal(cardCount, 11);
  assert.match(html, /唐陆禛/);
  assert.match(html, /李子健/);
  assert.match(html, /许明雪/);
  assert.match(html, /肖琳霏/);
  assert.match(html, /马玲/);
  assert.match(html, /石博羽/);
  assert.match(html, /许淼/);
  assert.match(html, /2026级访问学者/);
  assert.match(html, /2025级硕士研究生/);
  assert.match(html, /2023级硕士研究生/);
  assert.match(html, /毕业去向/);
  assert.match(html, /香港大学教育学院2026级博士生/);
  assert.doesNotMatch(html, /入学年份待补充|个人与研究简介待补充/);
  assert.doesNotMatch(html, /person-card__year/);
  assert.doesNotMatch(html, /href="\/zh\/people\/[^"]+"/);
});

test("renders the live AI Q&A surface and fails safely without a key", async () => {
  const page = await request("/en/ask");
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Ask the AI assistant/);
  assert.match(html, /What does Yizhou Fan mainly research/);
  assert.doesNotMatch(html, /Dr\. Fan|FanLearn Lab/);
  assert.match(html, /Answers are based only on public material on this site/);
  assert.match(html, /This site does not save question or answer history/);
  assert.match(html, /Do not submit private or sensitive information/);
  assert.doesNotMatch(html, /DeepSeek|anonymous Cookie|irreversible digest/);
  assert.doesNotMatch(html, /The assistant reads only public profile/);
  assert.match(html, /<section class="chat-panel"><div class="chat-history"/);
  assert.match(html, /<form class="chat-composer"/);
  assert.match(html, /id="quota-status"/);
  assert.match(html, /disabled=""/);
  assert.doesNotMatch(html, /Each visitor may ask/);

  const api = await request("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: "What does Yizhou Fan research?", lang: "en" }),
  });
  assert.equal(api.status, 503);
  assert.match(await api.text(), /model key has not been configured/i);
});

test("renders a bilingual institutional footer with public contact details", async () => {
  const english = await request("/en");
  const englishHtml = await english.text();
  assert.match(englishHtml, /Mailing address/);
  assert.match(englishHtml, /Room 419, Graduate School of Education/);
  assert.match(englishHtml, /Beijing 100871, China/);
  assert.match(englishHtml, /fyz@pku.edu.cn/);

  const chinese = await request("/zh");
  const chineseHtml = await chinese.text();
  assert.match(chineseHtml, /通讯地址/);
  assert.match(chineseHtml, /北京市海淀区颐和园路5号/);
  assert.match(chineseHtml, /邮编：100871/);
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
