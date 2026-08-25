export const languages = ["en", "zh"] as const;

export type Language = (typeof languages)[number];

export function isLanguage(value: string): value is Language {
  return languages.includes(value as Language);
}

export const profileLinks = {
  email: "mailto:fyz@pku.edu.cn",
  scholar: "https://scholar.google.com/citations?user=EBZdbGwAAAAJ&hl=en",
  pku: "https://english.gse.pku.edu.cn/faculty/technology/1062jyxyyw164100.htm",
  orcid: "https://orcid.org/0000-0003-2777-1705",
};

export const scholarSnapshot = {
  citations: 3962,
  hIndex: 30,
  i10Index: 46,
  asOf: "2026-08-25",
  sourceUrl: profileLinks.scholar,
} as const;

export const publications = [
  {
    year: 2026,
    kind: "Journal article",
    title:
      "A Metacognitive Approach to Learning and Performance in Human-AI Interaction",
    authors: "Yizhou Fan, J. Yan, I. Molenaar, S. Greiff, D. Gašević",
    venue: "Communications Psychology",
    featured: true,
    sourceUrl: "https://doi.org/10.31234/osf.io/s7dvk_v1",
  },
  {
    year: 2026,
    kind: "Journal article",
    title:
      "FLoRA: An advanced AI-powered engine to facilitate hybrid human-AI regulated learning",
    authors: "X. Li, T. Li, L. Yan, et al., Yizhou Fan",
    venue: "Computers & Education, 243, 105527",
    featured: true,
    sourceUrl: "https://www.sciencedirect.com/science/article/pii/S0360131525002969",
  },
  {
    year: 2026,
    kind: "Journal article",
    title:
      "‘Cloud for Youth’: An implementation research of cloud-based solutions for bridging the digital divide in rural China",
    authors: "Y. Shen, G. Huang, H. Le, et al., Yizhou Fan",
    venue: "British Journal of Educational Technology, 57(3), 844-868",
    featured: false,
    sourceUrl: "https://doi.org/10.1111/bjet.70037",
  },
  {
    year: 2026,
    kind: "Conference paper",
    title:
      "When LLMs fall short in deductive coding: Model comparisons and human-AI collaboration workflow design",
    authors: "Z. Li, L. Tang, M. Xia, et al., Yizhou Fan",
    venue: "LAK 2026, 685-696",
    featured: false,
    sourceUrl: "https://arxiv.org/abs/2512.21041",
  },
  {
    year: 2025,
    kind: "Journal article",
    title:
      "Beware of metacognitive laziness: Effects of generative artificial intelligence on learning motivation, processes, and performance",
    authors: "Yizhou Fan, L. Tang, H. Le, et al., D. Gašević",
    venue: "British Journal of Educational Technology, 56(2), 489-530",
    featured: true,
    sourceUrl: "https://doi.org/10.1111/bjet.13544",
  },
  {
    year: 2025,
    kind: "Journal article",
    title:
      "Breaking human dominance: Investigating learners’ preferences for learning feedback from generative AI and human tutors",
    authors: "H. Le, Y. Shen, Z. Li, et al., Yizhou Fan",
    venue: "British Journal of Educational Technology, 56(5), 1758-1783",
    featured: false,
    sourceUrl: "https://doi.org/10.1111/bjet.13614",
  },
  {
    year: 2025,
    kind: "Journal article",
    title:
      "Aligning and comparing values of ChatGPT and human as learning facilitators: A value-sensitive design approach",
    authors: "Y. Shen, L. Tang, H. Le, et al., Yizhou Fan",
    venue: "British Journal of Educational Technology, 56(4), 1391-1414",
    featured: false,
    sourceUrl: "https://doi.org/10.1111/bjet.13562",
  },
  {
    year: 2025,
    kind: "Book",
    title:
      "Learning with Generative Artificial Intelligence: What Empirical Studies Tell Us",
    authors: "Yizhou Fan",
    venue: "Routledge",
    featured: true,
    sourceUrl: "https://doi.org/10.4324/9781003632146",
  },
  {
    year: 2024,
    kind: "Book",
    title: "English Academic Writing in Practice",
    titleZh: "英文学术写作实战",
    authors: "Yizhou Fan, Torsten Juelich, Jun Mao",
    venue: "Tsinghua University Press",
    featured: false,
  },
  {
    year: 2024,
    kind: "Journal article",
    title:
      "Facilitating learners’ self-assessment during formative writing tasks using writing analytics toolkit",
    authors: "L. Tang, K. Shen, H. Le, et al., Yizhou Fan",
    venue: "Journal of Computer Assisted Learning, 40(6), 2822-2839",
    featured: false,
    sourceUrl: "https://doi.org/10.1111/jcal.13036",
  },
  {
    year: 2023,
    kind: "Journal article",
    title:
      "Towards a fuller picture: Triangulation and integration of the measurement of self-regulated learning based on trace and think aloud data",
    authors: "Yizhou Fan, M. Raković, J. van der Graaf, et al., D. Gašević",
    venue: "Journal of Computer Assisted Learning, 39(4), 1303-1324",
    featured: false,
    sourceUrl: "https://doi.org/10.1111/jcal.12801",
  },
  {
    year: 2022,
    kind: "Journal article",
    title:
      "Improving the measurement of self-regulated learning using multi-channel data",
    authors: "Yizhou Fan, L. Lim, J. van der Graaf, et al., D. Gašević",
    venue: "Metacognition and Learning, 17, 1025-1055",
    featured: false,
    sourceUrl: "https://doi.org/10.1007/s11409-022-09304-z",
  },
] as const;

export const talks = [
  {
    id: "talk-2026-07-bavaria",
    date: "2026.07",
    displayOrder: 1,
    title: "A Metacognitive Approach to Learning and Performance in Human-AI Interaction",
    host: "Bavarian Learning Analytics Network and University of Hagen, Germany",
  },
  {
    id: "talk-002",
    date: "2026.04",
    displayOrder: 2,
    title: "Shifting From Product-Oriented to Process-Oriented Assessment with Learning Analytics",
    host: "The 6th Workshop on Learning Analytics and Assessment (LAK26), Norway",
  },
  {
    id: "talk-003",
    date: "2026.04",
    displayOrder: 3,
    title: "Beware of Metacognitive Laziness in Learning with GenAI",
    host: "The University of California, Riverside, USA",
  },
  {
    id: "talk-004",
    date: "2026.02",
    displayOrder: 4,
    title: "Revealing and Avoiding Metacognitive Laziness while Learning with GenAI",
    host: "The University College of London, UK",
  },
  {
    id: "talk-2025-12-new-liberal-arts",
    date: "2025.12",
    displayOrder: 5,
    title: "Learning with GenAI to solve real-world and high-challenge tasks",
    host: "1st International Conference on New Liberal Arts, Hong Kong, China",
  },
  {
    id: "talk-005",
    date: "2025.11",
    displayOrder: 6,
    title: "Designing, scaffolding, and coding complex human-AI interactions and collaboration processes",
    host: "The University of Hong Kong, Hong Kong, China",
  },
  {
    id: "talk-006",
    date: "2025.11",
    displayOrder: 7,
    title: "Learning with GenAI: Beware the Trap of Metacognitive Laziness",
    host: "International Conference on Intelligent Education and Research, Wuhan, China",
  },
  {
    id: "talk-2025-04-oulu",
    date: "2025.04",
    displayOrder: 8,
    title: "Beware of Metacognitive Laziness in Learning with GenAI",
    host: "University of Oulu, Finland",
  },
  {
    id: "talk-2024-03-lak24",
    date: "2024.03",
    displayOrder: 9,
    title: "Learning and Regulating with ChatGPT: What Experimental Study Tells Us?",
    host: "LAK24 Conference, Japan",
  },
  {
    id: "talk-2023-09-earli23",
    date: "2023.09",
    displayOrder: 10,
    title: "When and why learners benefit from personalized scaffoldings for self-regulated learning",
    host: "EARLI-23 Conference, Greece",
  },
  {
    id: "talk-2022-09-sig27",
    date: "2022.09",
    displayOrder: 11,
    title: "Improving the measurement of selfregulated learning using multichannel data: A FLoRA Case Study",
    host: "SIG-27 Workshop, UK",
  },
] as const;

export const people = [
  { name: "Jiaqi Xu", nameZh: "许家奇", position: "Boya Postdoctoral Fellow", positionZh: "博雅博士后" },
  { name: "Mengyu Xia", nameZh: "夏梦雨", position: "Ph.D. student", positionZh: "博士研究生" },
  { name: "Mingxue Xu", nameZh: "许明雪", position: "Ph.D. student", positionZh: "博士研究生" },
  { name: "Ling Ma", nameZh: "马玲", position: "Ph.D. student", positionZh: "博士研究生" },
  { name: "Zijian Li", nameZh: "李子健", position: "Master’s student", positionZh: "硕士研究生" },
  { name: "Taolin Zhu", nameZh: "朱桃林", position: "Master’s student", positionZh: "硕士研究生" },
  { name: "Linfei Xiao", nameZh: "肖琳霏", position: "Master’s student", positionZh: "硕士研究生" },
  { name: "Junyang Ma", nameZh: "马郡阳", position: "Master’s student", positionZh: "硕士研究生" },
  { name: "Luzhen Tang", nameZh: "唐陆稹", position: "Alumnus · Ph.D. student at HKU", positionZh: "毕业生 · 香港大学博士研究生" },
] as const;

export const content = {
  en: {
    locale: "en-US",
    name: "Yizhou Fan",
    role: "Assistant Professor · Research Fellow",
    affiliation: "Graduate School of Education, Peking University",
    nav: {
      home: "Home",
      profile: "Biography",
      publications: "Publications",
      talks: "Talks",
      teaching: "Courses",
      people: "Team",
      ask: "AI Q&A",
    },
    heroEyebrow: "Learning sciences · Analytics · Artificial intelligence",
    heroTitle: "Learning, humans, and AI.",
    heroBody:
      "I study how people regulate, understand, and grow through learning with AI - and how technology can support that growth without taking over the thinking that makes learning meaningful.",
    primaryAction: "Explore selected work",
    secondaryAction: "Read a short bio",
    researchTitle: "A research programme from process to practice",
    researchIntro:
      "The work connects fine-grained evidence about learning processes with theory, intervention design, and educational practice.",
    researchAreas: [
      ["01", "Measure", "Make learning processes visible through trace, dialogue, eye-tracking, and multimodal data."],
      ["02", "Explain", "Model self-regulation, metacognition, and human-AI collaboration as dynamic processes."],
      ["03", "Intervene", "Design scaffolds and learning environments that return judgment and agency to learners."],
      ["04", "Translate", "Connect rigorous research with classrooms, teacher development, and educational equity."],
    ],
    selectedTitle: "Selected work",
    selectedIntro: "Recent books and papers that anchor the current research agenda.",
    allPublications: "View publication archive",
    talksTitle: "Ideas in circulation",
    talksIntro: "Search talks by title, host, or year.",
    allTalks: "View all talks",
    peopleTitle: "People I work with",
    peopleIntro: "Current advisees, collaborators, and alumni.",
    allPeople: "View people",
    contactTitle: "Research, teaching, or an invitation?",
    contactBody: "For scholarly collaboration, talks, and research enquiries, email is the most direct route.",
    emailAction: "Email fyz@pku.edu.cn",
    footer: "Assistant Professor and Research Fellow, Graduate School of Education, Peking University",
  },
  zh: {
    locale: "zh-CN",
    name: "范逸洲",
    role: "助理教授 · 研究员",
    affiliation: "北京大学教育学院",
    nav: {
      home: "首页",
      profile: "个人简介",
      publications: "学术成果",
      talks: "学术报告",
      teaching: "教授课程",
      people: "团队成员",
      ask: "AI 问答",
    },
    heroEyebrow: "学习科学 · 学习分析 · 人工智能",
    heroTitle: "让人工智能真正服务于人的持续成长。",
    heroBody:
      "我的研究关注学习者如何在与人工智能互动中进行调节、理解与成长，并探索如何让技术支持学习，而不替代学习中最重要的判断、反思与能动性。",
    primaryAction: "浏览代表成果",
    secondaryAction: "阅读个人简介",
    researchTitle: "从过程证据走向教育实践",
    researchIntro: "把细粒度的学习过程证据与理论建构、智能干预和真实教育场景连接起来。",
    researchAreas: [
      ["01", "测量", "通过行为轨迹、对话、眼动与多模态数据，让学习过程变得可见。"],
      ["02", "解释", "将自我调节、元认知与人机协同理解为动态变化的过程。"],
      ["03", "干预", "设计把判断力与能动性交还给学习者的脚手架和学习环境。"],
      ["04", "转化", "让严谨研究进入课堂、教师发展与教育公平实践。"],
    ],
    selectedTitle: "代表成果",
    selectedIntro: "支撑当前研究议程的近期著作与论文。",
    allPublications: "查看全部成果",
    talksTitle: "流动中的思想",
    talksIntro: "可按题目、主办方或年份检索学术报告。",
    allTalks: "查看全部报告",
    peopleTitle: "共同研究的人",
    peopleIntro: "一起开展学习科学与人工智能教育研究的团队成员。",
    allPeople: "查看团队成员",
    contactTitle: "研究合作、教学或报告邀请？",
    contactBody: "学术合作、报告邀请与研究咨询，请优先通过电子邮件联系。",
    emailAction: "发送邮件至 fyz@pku.edu.cn",
    footer: "北京大学教育学院 助理教授、研究员",
  },
} as const;

export type SiteContent = (typeof content)[Language];
