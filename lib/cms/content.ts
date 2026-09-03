import { content, people as fallbackPeople, publications as fallbackPublications, scholarSnapshot, talks as fallbackTalks, type Language } from "../content";
import { sanityQuery } from "./sanity";
import type { PublicCourse, PublicPerson, PublicProfile, PublicPublication, PublicTalk } from "./types";

const publicationQuery = `*[_type == "publication" && status == "published"] | order(year desc, title.en asc) {
  "id": _id,
  year,
  kind,
  language,
  "title": coalesce(title.en, title.zh),
  "titleZh": title.zh,
  authors,
  venue,
  volume,
  issue,
  pages,
  articleNumber,
  featured,
  doi,
  "abstract": abstract.en,
  "abstractZh": abstract.zh,
  keywords,
  sourceUrl,
  "pdfUrl": select(publicFile.copyrightCleared == true => coalesce(publicFile.file.asset->url, publicFile.url)),
  bibtex
}`;

const talkQuery = `*[_type == "talk" && status == "published"] | order(date desc, displayOrder asc) {
  "id": _id,
  date,
  displayOrder,
  "title": coalesce(title.en, title.zh),
  "titleZh": title.zh,
  "host": coalesce(host.en, host.zh),
  "hostZh": host.zh,
  "summary": coalesce(summary.en, summary.zh),
  "summaryZh": summary.zh,
  keywords,
  "body": body.en[]{..., _type == "reportImage" => {..., "imageUrl": asset->url}},
  "bodyZh": body.zh[]{..., _type == "reportImage" => {..., "imageUrl": asset->url}},
  "attachments": attachments[copyrightCleared == true && defined(file.asset)][]{
    "label": label.en,
    "labelZh": label.zh,
    "note": note.en,
    "noteZh": note.zh,
    "url": file.asset->url,
    "mimeType": file.asset->mimeType
  },
  "slidesUrl": coalesce(attachments[copyrightCleared == true && defined(file.asset)][0].file.asset->url, select(publicFile.copyrightCleared == true => coalesce(publicFile.file.asset->url, publicFile.url))),
  "slidesFormat": select(
    attachments[copyrightCleared == true && defined(file.asset)][0].file.asset->mimeType == "application/pdf" => "pdf",
    defined(attachments[copyrightCleared == true && defined(file.asset)][0].file.asset) => "pptx",
    defined(publicFile.format) => publicFile.format,
    publicFile.file.asset->mimeType == "application/pdf" => "pdf",
    "pptx"
  )
}`;

const peopleQuery = `*[_type == "person" && status == "published"] | order(enrollmentYear desc, order asc, name.en asc) {
  "id": _id,
  "name": name.en,
  "nameZh": name.zh,
  "position": coalesce(position.en, position.zh),
  "positionZh": position.zh,
  enrollmentYear,
  "bio": bio.en,
  "bioZh": bio.zh,
  "portraitUrl": portrait.asset->url,
  order,
  profileUrl,
  publicEmail
}`;

const courseQuery = `*[_type == "course" && status == "published"] | order(order asc, title.en asc) {
  "id": _id,
  "title": title.en,
  "titleZh": title.zh,
  "nature": nature.en,
  "natureZh": nature.zh,
  "description": description.en,
  "descriptionZh": description.zh,
  "role": role.en,
  "roleZh": role.zh,
  offeredSince,
  mooc,
  moocUrl,
  order
}`;

const profileQuery = `*[_type == "profile" && status == "published"][0] {
  "name": select($lang == "zh" => name.zh, name.en),
  "role": select($lang == "zh" => role.zh, role.en),
  "affiliation": select($lang == "zh" => affiliation.zh, affiliation.en),
  email,
  "bio": [select($lang == "zh" => bio.zh, bio.en)],
  "researchStatement": select($lang == "zh" => researchStatement.zh, researchStatement.en),
  "researchInterests": researchInterests[]{"value": select($lang == "zh" => zh, en)}.value,
  "appointments": appointments[]{year, "institution": select($lang == "zh" => institution.zh, institution.en), "role": select($lang == "zh" => role.zh, role.en)},
  "honors": honors[]{year, "title": select($lang == "zh" => title.zh, title.en)},
  "publicProjects": publicProjects[publiclyConfirmed == true]{year, "title": select($lang == "zh" => title.zh, title.en)},
  scholarMetrics,
  "academicService": select($lang == "zh" => academicService.zh, academicService.en)
}`;

export const fallbackCourses: PublicCourse[] = [
  {
    id: "course-learning-analytics",
    title: "Learning Analytics",
    titleZh: "学习分析",
    nature: "Peking University postgraduate course",
    natureZh: "北京大学研究生课程",
    description: "A research-methods course that combines flipped learning with project-based practice. Students work with authentic multimodal learning data and learn to select, apply, and critically compare methods including sequence mining, predictive analytics, feature engineering, unsupervised learning, and network analysis.",
    descriptionZh: "面向硕博研究生的研究方法课程，采用翻转课堂与项目式教学。学生基于真实的多模态学习数据，学习序列挖掘、预测分析、特征工程、无监督机器学习和网络分析等方法，并在实践中判断不同技术的适用范围与局限。",
    offeredSince: "2023",
    order: 10,
  },
  {
    id: "course-information-technology-management",
    title: "Information Technology and Higher Education Management",
    titleZh: "信息技术与高校管理",
    nature: "Peking University EdD course",
    natureZh: "北京大学 EdD 课程",
    description: "An EdD course examining how information technology, data, and artificial intelligence are reshaping higher education management. It helps education leaders develop a grounded framework for evaluating digital change and applying technology to institutional decision-making and governance.",
    descriptionZh: "面向教育博士的课程，从高校管理场景出发讨论信息技术、数据与人工智能对组织治理和决策的影响，帮助学习者形成理解数字化变革、评估技术方案并联系管理实践的基本框架。",
    offeredSince: "2023",
    order: 20,
  },
  {
    id: "course-academic-writing-ai",
    title: "English Academic Writing in the Age of AI",
    titleZh: "智能时代的英文学术写作",
    nature: "Peking University undergraduate course",
    natureZh: "北京大学本科生课程",
    description: "A flipped course for students across disciplines that develops academic reading and writing through structure, logic, style, audience, and storytelling. It also builds critical judgment about when and how generative AI can support writing without compromising academic integrity or authorial control.",
    descriptionZh: "面向不同学科本科生的翻转课堂，围绕学术论文的结构、逻辑、风格、受众与叙事训练英文读写能力，同时培养学生对生成式人工智能的批判性判断，理解如何在保持学术诚信与作者主导的前提下规范使用相关工具。",
    order: 30,
  },
  {
    id: "course-human-computer-interaction",
    title: "Human-Computer Interaction Design",
    titleZh: "人机交互设计",
    nature: "Peking University postgraduate course",
    natureZh: "北京大学研究生课程",
    description: "A project-based course connecting educational technology theory, research, and product practice. Students move from user modelling and needs analysis to prototyping, evaluation, and iterative design while working on authentic educational technology development projects.",
    descriptionZh: "以真实教育技术产品研发项目为载体，将理论、研究与产品实践结合起来。学生从用户建模和需求分析出发，完成原型设计、评估与迭代，在项目协作中掌握教育技术产品的人机交互设计方法。",
    order: 40,
  },
  {
    id: "course-ai-literacy-academic",
    title: "AI Literacy for Academic Purposes",
    titleZh: "面向学术的 AI 素养",
    nature: "Peking University postgraduate course",
    natureZh: "北京大学研究生课程",
    description: "A graduate course cultivating durable foundations for research with AI rather than short-term tool proficiency. Through cases, projects, and human-AI interaction, students develop skills in questioning, feedback, computational thinking, ethical judgment, creativity, collaboration, and connecting knowledge across disciplines.",
    descriptionZh: "面向研究生培养智能时代开展科研所需的底层素养，而非追求工具速成。课程通过案例、项目和人机互动，训练发问、反馈、计算思维、伦理判断、创造力、协同合作与跨学科知识连接等能力。",
    order: 50,
  },
];

function fallbackPublicationRows(): PublicPublication[] {
  return fallbackPublications.map((item, index) => {
    const titleZh = "titleZh" in item && typeof item.titleZh === "string" ? item.titleZh : undefined;
    const pdfUrl = "pdfUrl" in item && typeof item.pdfUrl === "string" ? item.pdfUrl : undefined;
    const sourceUrl = "sourceUrl" in item && typeof item.sourceUrl === "string" ? item.sourceUrl : undefined;
    return {
      id: `fallback-publication-${index}`,
      year: item.year,
      kind: item.kind,
      title: item.title,
      titleZh,
      authors: item.authors,
      venue: item.venue,
      featured: item.featured,
      pdfUrl,
      sourceUrl,
    };
  });
}

function fallbackTalkRows(): PublicTalk[] {
  return fallbackTalks.map((item, index) => ({
    id: "id" in item && typeof item.id === "string" ? item.id : `fallback-talk-${index}`,
    date: item.date,
    displayOrder: "displayOrder" in item && typeof item.displayOrder === "number" ? item.displayOrder : index + 1,
    title: item.title,
    titleZh: "titleZh" in item && typeof item.titleZh === "string" ? item.titleZh : undefined,
    host: item.host,
    hostZh: "hostZh" in item && typeof item.hostZh === "string" ? item.hostZh : undefined,
  }));
}

function fallbackPeopleRows(): PublicPerson[] {
  return fallbackPeople.map((item, index) => ({
    id: `fallback-person-${index}`,
    ...item,
  }));
}

export async function getPublications(): Promise<PublicPublication[]> {
  return (await sanityQuery<PublicPublication[]>(publicationQuery)) ?? fallbackPublicationRows();
}

export async function getTalks(): Promise<PublicTalk[]> {
  return (await sanityQuery<PublicTalk[]>(talkQuery)) ?? fallbackTalkRows();
}

export async function getTalkById(id: string): Promise<PublicTalk | null> {
  const talks = await getTalks();
  return talks.find((talk) => talk.id === id) ?? null;
}

export async function getPeople(): Promise<PublicPerson[]> {
  return (await sanityQuery<PublicPerson[]>(peopleQuery)) ?? fallbackPeopleRows();
}

export async function getCourses(): Promise<PublicCourse[]> {
  const rows = await sanityQuery<PublicCourse[]>(courseQuery);
  return rows?.length ? rows : fallbackCourses;
}

export function fallbackProfile(lang: Language): PublicProfile {
  const zh = lang === "zh";
  return {
    name: content[lang].name,
    role: content[lang].role,
    affiliation: content[lang].affiliation,
    email: "fyz@pku.edu.cn",
    bio: zh ? [
      "范逸洲博士是北京大学教育学院助理教授、研究员，教育技术系副主任，并任莫纳什大学信息技术学院兼职研究员。",
      "其研究围绕教育与人工智能、人机交互与协同、学习分析、元认知与自我调节学习、科研智能和模拟学习展开，关注学习过程测量、机制解释与智能干预在真实教育场景中的应用。",
    ] : [
      "Dr. Yizhou Fan is an Assistant Professor and Research Fellow at the Graduate School of Education, Peking University, Deputy Director of the Department of Educational Technology, and an Adjunct Research Fellow at Monash University.",
      "His research spans AI in education, human-AI interaction and collaboration, learning analytics, metacognition and self-regulated learning, scientific intelligence, and simulated learning, connecting the measurement of learning processes with mechanism-building and intelligent interventions in authentic educational settings.",
    ],
    researchStatement: content[lang].heroBody,
    researchInterests: zh
      ? ["教育与人工智能", "人机交互与协同", "学习分析", "元认知", "自我调节学习", "科研智能", "模拟学习"]
      : ["AI in Education", "Human-AI Interaction and Collaboration", "Learning Analytics", "Metacognition", "Self-regulated Learning", "Scientific Intelligence", "Simulated Learning"],
    appointments: [
      {year: "2023-present", institution: zh ? "北京大学" : "Peking University", role: zh ? "教育学院助理教授、研究员" : "Assistant Professor and Research Fellow, Graduate School of Education"},
      {year: "2025-present", institution: zh ? "北京大学" : "Peking University", role: zh ? "教育技术系副主任" : "Deputy Director, Department of Educational Technology"},
      {year: "2022-present", institution: zh ? "莫纳什大学" : "Monash University", role: zh ? "信息技术学院兼职研究员" : "Adjunct Research Fellow, Faculty of Information Technology"},
      {year: "2026", institution: zh ? "伦敦大学学院" : "University College London", role: zh ? "UCL Knowledge Lab 访问学者" : "Visiting Scholar, UCL Knowledge Lab"},
      {year: "2019-2023", institution: zh ? "爱丁堡大学" : "The University of Edinburgh", role: zh ? "信息学院博士后研究员" : "Post-doctoral Research Associate, School of Informatics"},
    ],
    honors: [
      {year: "2026", title: zh ? "最佳学生论文提名（指导研究生），第 30 届全球华人计算机教育应用大会（GCCCE）" : "Best Student Paper Nomination, 30th Global Chinese Conference on Computers in Education (GCCCE)"},
      {year: "2026", title: zh ? "最佳长论文提名（指导研究生），第 16 届国际学习分析与知识会议（LAK）" : "Best Full Paper Nomination, 16th International Learning Analytics and Knowledge Conference (LAK)"},
      {year: "2025", title: zh ? "第二届全球数字智能教育创新（AI for Learning）银奖，DI-IDEA" : "2nd Global Digital Intelligence Education Innovation (AI for learning), Silver Winner, DI-IDEA"},
      {year: "2024", title: zh ? "黄廷方-信和青年杰出学者，北京大学" : "NG Teng Fong / Sino Scholarship for Outstanding Young Researcher, Peking University"},
      {year: "2024", title: zh ? "QS 重塑教育奖（E-Learning 赛道 - FLoRA）银奖，QS Quacquarelli Symonds" : "QS Reimagine Education Award (E-Learning Project - FLoRA), Silver Winner, QS Quacquarelli Symonds"},
      {year: "2024", title: zh ? "最佳论文奖（指导研究生），第 17 届国际混合式学习会议（ICBL）" : "Best Paper Award, 17th International Conference on Blended Learning (ICBL)"},
      {year: "2023", title: zh ? "新锐学者奖，国际学习分析研究学会（SoLAR）" : "Emerging Scholar Award, Society for Learning Analytics Research (SoLAR)"},
    ],
    publicProjects: [
      {year: "2025-2027", title: zh ? "国家自然科学基金（NSFC）青年课题 · 基于生成式人工智能建构元认知脚手架的关键技术及实证应用研究" : "National Natural Science Foundation of China (NSFC) · Research on Key Technologies and Empirical Applications of Metacognitive Scaffolding Based on Generative Artificial Intelligence"},
      {year: "2026-2028", title: zh ? "北京市自然科学基金-副中心联合基金（培育项目） · 人机协同情境下元认知能力的复杂系统建模、动态诊断与自适应干预研究" : "Beijing Natural Science Foundation–Municipal Administrative Center Joint Fund (Cultivation Project) · Complex-systems Modelling, Dynamic Diagnosis, and Adaptive Intervention of Metacognitive Ability in Human-AI Collaboration"},
      {year: "2023-2027", title: zh ? "阿里巴巴公益基金会 · 欠发达地区师生人工智能素养提升项目" : "Alibaba Foundation · Project to Improve the AI Literacy of Teachers and Students in Underdeveloped Areas"},
      {year: "2023-2024", title: "SoLAR Early Career Research (ECR) Grant · Measuring and Scaffolding Hybrid Human-AI Regulation: Comparing Learning Processes Facilitated by ChatGPT and Human Experts"},
    ],
    scholarMetrics: scholarSnapshot,
    academicService: zh
      ? "担任 British Journal of Educational Technology 与 Journal of Learning Analytics 编委，并参与人工智能教育、自我调节学习与学习分析相关专刊及国际会议组织。"
      : "Editorial board member for the British Journal of Educational Technology and Journal of Learning Analytics, with guest-editing and conference leadership across AI in education, self-regulated learning, and learning analytics.",
  };
}

export async function getProfile(lang: Language): Promise<PublicProfile> {
  const profile = await sanityQuery<PublicProfile | null>(profileQuery, {lang});
  return profile ? {...profile, scholarMetrics: profile.scholarMetrics ?? scholarSnapshot} : fallbackProfile(lang);
}
