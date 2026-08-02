import { content, people as fallbackPeople, publications as fallbackPublications, talks as fallbackTalks, type Language } from "../content";
import { sanityQuery } from "./sanity";
import type { PublicPerson, PublicProfile, PublicPublication, PublicTalk } from "./types";

const publicationQuery = `*[_type == "publication" && status == "published"] | order(year desc, title.en asc) {
  "id": _id,
  year,
  kind,
  "title": title.en,
  "titleZh": title.zh,
  authors,
  venue,
  featured,
  doi,
  "abstract": abstract.en,
  "abstractZh": abstract.zh,
  keywords,
  sourceUrl,
  "pdfUrl": select(publicFile.copyrightCleared == true => coalesce(publicFile.file.asset->url, publicFile.url)),
  bibtex
}`;

const talkQuery = `*[_type == "talk" && status == "published"] | order(date desc) {
  "id": _id,
  date,
  type,
  "title": title.en,
  "titleZh": title.zh,
  "host": host.en,
  "hostZh": host.zh,
  "summary": summary.en,
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

const peopleQuery = `*[_type == "person" && status == "published"] | order(order asc, name.en asc) {
  "id": _id,
  "name": name.en,
  "nameZh": name.zh,
  "status": position.en,
  "statusZh": position.zh,
  category,
  "portraitUrl": portrait.asset->url
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
  "courses": courses[]{
    "title": select($lang == "zh" => title.zh, title.en),
    "nature": select($lang == "zh" => nature.zh, nature.en)
  },
  "academicService": select($lang == "zh" => academicService.zh, academicService.en)
}`;

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
    id: `fallback-talk-${index}`,
    date: item.date,
    type: item.type,
    title: item.title,
    host: item.host,
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

export function fallbackProfile(lang: Language): PublicProfile {
  const zh = lang === "zh";
  return {
    name: content[lang].name,
    role: content[lang].role,
    affiliation: content[lang].affiliation,
    email: "fyz@pku.edu.cn",
    bio: zh ? [
      "范逸洲博士是北京大学教育学院助理教授、研究员，教育技术系副主任，并任莫纳什大学信息技术学院兼职研究员。他的研究聚焦人工智能教育、学习分析、元认知、自我调节学习与人机协同。",
      "他的工作从学习过程测量出发，解释学习机制，设计智能干预，并把研究带回真实课堂与教育公平实践。他强调，人工智能支持学习的价值不应只由任务完成效率衡量，更要看学习者是否仍在形成自己的判断。",
    ] : [
      "Dr. Yizhou Fan is an Assistant Professor and Research Fellow at the Graduate School of Education, Peking University, Deputy Director of the Department of Educational Technology, and an Adjunct Research Fellow at Monash University. His research focuses on AI in education, learning analytics, metacognition, self-regulated learning, and human-AI collaboration.",
      "His work moves from measuring learning processes to explaining mechanisms, designing intelligent interventions, and translating evidence into classrooms and educational equity practice. A central concern is whether learners continue to develop judgment as AI becomes more capable.",
    ],
    researchStatement: content[lang].heroBody,
    researchInterests: zh
      ? ["人工智能教育", "人机交互与协同", "学习分析", "元认知与自我调节学习", "模拟学习", "教育公平与数字鸿沟"]
      : ["AI in Education", "Human-AI Interaction and Synergy", "Learning Analytics", "Metacognition and Self-regulated Learning", "Simulated Learning", "Educational Equity and the Digital Divide"],
    appointments: [
      {year: "2023-present", institution: zh ? "北京大学" : "Peking University", role: zh ? "教育学院助理教授、研究员" : "Assistant Professor and Research Fellow, Graduate School of Education"},
      {year: "2025-present", institution: zh ? "北京大学" : "Peking University", role: zh ? "教育技术系副主任" : "Deputy Director, Department of Educational Technology"},
      {year: "2022-present", institution: zh ? "莫纳什大学" : "Monash University", role: zh ? "信息技术学院兼职研究员" : "Adjunct Research Fellow, Faculty of Information Technology"},
      {year: "2026", institution: zh ? "伦敦大学学院" : "University College London", role: zh ? "UCL Knowledge Lab 访问学者" : "Visiting Scholar, UCL Knowledge Lab"},
      {year: "2019-2023", institution: zh ? "爱丁堡大学" : "The University of Edinburgh", role: zh ? "信息学院助理研究员、博士后" : "Post-doctoral Research Associate, School of Informatics"},
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
      {year: "2025-2027", title: zh ? "国家自然科学基金 · 基于生成式人工智能的元认知脚手架研究" : "NSFC · Metacognitive scaffolding based on generative AI"},
      {year: "2026-2028", title: zh ? "北京市自然科学基金 · 人机协同中的元认知动态诊断与自适应干预" : "Beijing Natural Science Foundation · Adaptive metacognitive intervention in human-AI collaboration"},
      {year: "2023-2027", title: zh ? "阿里巴巴公益基金会 · 资源薄弱地区师生人工智能素养研究" : "Alibaba Foundation · AI literacy in under-resourced areas"},
      {year: "2023-2024", title: zh ? "SoLAR 青年学者基金 · 人机混合调节的测量与支持" : "SoLAR Early Career Research Grant · Hybrid human-AI regulation"},
    ],
    courses: zh ? [
      {title: "学习分析", nature: "北京大学研究生课程"},
      {title: "信息技术与高校管理", nature: "北京大学 EdD 课程"},
      {title: "人工智能时代的英文学术写作", nature: "北京大学本科生课程"},
      {title: "学术写作（英文）", nature: "北京大学研究生课程"},
      {title: "人机交互设计", nature: "北京大学研究生课程"},
      {title: "面向学术的 AI 素养", nature: "北京大学研究生课程"},
      {title: "教育技术学博士生研讨课", nature: "北京大学研究生课程"},
      {title: "英文学术写作实战", nature: "MOOC · 课程负责人"},
      {title: "同伴教学法", nature: "MOOC · 课程负责人"},
      {title: "教师如何做研究", nature: "国家级精品在线开放课程 · 核心成员"},
      {title: "翻转课堂教学法", nature: "MOOC · 核心成员"},
    ] : [
      {title: "Learning Analytics", nature: "Peking University postgraduate course"},
      {title: "Information Technology and Higher Education Management", nature: "Peking University EdD course"},
      {title: "English Academic Writing in the Age of AI", nature: "Peking University undergraduate course"},
      {title: "Academic Writing in English", nature: "Peking University postgraduate course"},
      {title: "Human-Computer Interaction Design", nature: "Peking University postgraduate course"},
      {title: "AI Literacy for Academic Purposes", nature: "Peking University postgraduate course"},
      {title: "Doctoral Seminar on Educational Technology", nature: "Peking University postgraduate course"},
      {title: "English Academic Writing in Practice", nature: "MOOC · Course lead"},
      {title: "Peer Instruction", nature: "MOOC · Course lead"},
      {title: "How Do Teachers Do Research", nature: "National Excellent MOOC · Core team member"},
      {title: "Flipped Classroom Pedagogy", nature: "MOOC · Core team member"},
    ],
    academicService: zh
      ? "担任 British Journal of Educational Technology 与 Journal of Learning Analytics 编委，并参与人工智能教育、自我调节学习与学习分析相关专刊及国际会议组织。"
      : "Editorial board member for the British Journal of Educational Technology and Journal of Learning Analytics, with guest-editing and conference leadership across AI in education, self-regulated learning, and learning analytics.",
  };
}

export async function getProfile(lang: Language): Promise<PublicProfile> {
  return (await sanityQuery<PublicProfile | null>(profileQuery, {lang})) ?? fallbackProfile(lang);
}
