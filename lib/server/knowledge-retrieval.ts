import type {Language} from "../content";
import type {PublicCourse, PublicPerson, PublicProfile, PublicPublication, PublicTalk} from "../cms/types";

export const MAX_SELECTED_PUBLICATIONS = 10;
export const PUBLIC_KNOWLEDGE_MAX_CHARS = 28_000;

const sectionBudgets = {
  profile: 4200,
  teaching: 3500,
  honors: 1600,
  projects: 2000,
  group: 900,
  talks: 4200,
  people: 4600,
} as const;

type KnowledgeInput = {
  lang: Language;
  question: string;
  profile: PublicProfile;
  publications: PublicPublication[];
  talks: PublicTalk[];
  people: PublicPerson[];
  courses: PublicCourse[];
};

function compact(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/gu, " ").trim() : "";
}

function truncate(value: string, limit: number) {
  const text = compact(value);
  if (limit <= 0) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 1)).replace(/[，、；：,.!?\s]+$/u, "")}…`;
}

function localized(primary: string | undefined, fallback: string | undefined) {
  return compact(primary) || compact(fallback);
}

function fitEntries(heading: string, entries: string[], budget: number) {
  const cleanEntries = entries.map(compact).filter(Boolean);
  if (cleanEntries.length === 0) return heading;
  const complete = `${heading}\n${cleanEntries.join("\n")}`;
  if (complete.length <= budget) return complete;
  const available = Math.max(0, budget - heading.length - cleanEntries.length);
  const perEntry = Math.max(1, Math.floor(available / cleanEntries.length));
  return `${heading}\n${cleanEntries.map((entry) => truncate(entry, perEntry)).join("\n")}`;
}

const publicationIntent = /publication|paper|article|book|chapter|bibliograph|stud(?:y|ies)|research (?:work|output|finding|result)|published|wrote|written|authored|成果|论文|文章|著作|书籍|章节|文献|发表|出版|研究(?:成果|工作|发现|结论)/iu;
const ignoredTerms = new Set([
  "about", "and", "are", "does", "for", "from", "has", "have", "his", "how", "into", "its", "most", "that", "the", "their", "these", "this", "what", "which", "with", "yizhou", "fan",
  "什么", "哪些", "相关", "研究", "成果", "有哪",
]);

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[\s‐‑‒–—―_-]+/gu, " ");
}

function extractTerms(question: string) {
  const normalized = normalize(question);
  const terms = new Set<string>();
  for (const match of normalized.matchAll(/[\p{Script=Han}]+|[\p{Letter}\p{Number}]+/gu)) {
    const term = match[0];
    if (/^\p{Script=Han}+$/u.test(term)) {
      if (term.length <= 8) terms.add(term);
      for (let index = 0; index < term.length - 1; index += 1) terms.add(term.slice(index, index + 2));
    } else if ((term.length >= 3 || /^\d{4}$/u.test(term)) && !ignoredTerms.has(term)) {
      terms.add(term);
    }
  }

  const aliases: Array<[RegExp, string[]]> = [
    [/生成式\s*(?:ai|人工智能)|\bgenai\b|generative (?:ai|artificial intelligence)/iu, ["生成式", "人工智能", "generative", "genai", "artificial intelligence"]],
    [/学习分析|learning analytics/iu, ["学习分析", "learning analytics"]],
    [/自我调节|self regulated|self-regulated/iu, ["自我调节", "self regulated"]],
    [/元认知|metacognit/iu, ["元认知", "metacognit"]],
    [/人机|human ai|human-ai/iu, ["人机", "human ai"]],
  ];
  for (const [pattern, values] of aliases) {
    if (pattern.test(normalized)) values.forEach((value) => terms.add(normalize(value)));
  }
  return [...terms].filter((term) => term.length >= 2 && !ignoredTerms.has(term));
}

function matchScore(haystack: string, term: string, weight: number) {
  return haystack && term && haystack.includes(term) ? weight : 0;
}

function scorePublication(publication: PublicPublication, terms: string[], question: string) {
  const title = normalize(`${publication.title} ${publication.titleZh ?? ""}`);
  const keywords = normalize((publication.keywords ?? []).join(" "));
  const abstract = normalize(`${publication.abstract ?? ""} ${publication.abstractZh ?? ""}`);
  const authors = normalize(publication.authors);
  const venue = normalize(publication.venue);
  let score = 0;
  for (const term of terms) {
    score += matchScore(title, term, 12);
    score += matchScore(keywords, term, 8);
    score += matchScore(abstract, term, 3);
    score += matchScore(authors, term, 2);
    score += matchScore(venue, term, 2);
    if (term === String(publication.year)) score += 10;
  }
  const exactTitles = [publication.title, publication.titleZh]
    .filter((value): value is string => Boolean(value))
    .map(normalize);
  if (exactTitles.some((titleText) => titleText.length >= 8 && question.includes(titleText))) score += 80;
  return score;
}

export function selectRelevantPublications(
  publications: PublicPublication[],
  question: string,
  limit = MAX_SELECTED_PUBLICATIONS,
) {
  if (limit <= 0 || publications.length === 0) return [];
  const normalizedQuestion = normalize(question);
  const terms = extractTerms(question);
  const ranked = publications.map((publication) => ({
    publication,
    score: scorePublication(publication, terms, normalizedQuestion),
  }));
  const hasStrongMatch = ranked.some((item) => item.score >= 8);
  const hasPublicationIntent = publicationIntent.test(normalizedQuestion);
  if (!hasPublicationIntent && !hasStrongMatch) return [];
  const hasAnyMatch = ranked.some((item) => item.score > 0);

  return ranked
    .filter((item) => hasAnyMatch ? item.score > 0 : hasPublicationIntent)
    .sort((left, right) => right.score - left.score
      || Number(Boolean(right.publication.featured)) - Number(Boolean(left.publication.featured))
      || right.publication.year - left.publication.year
      || left.publication.title.localeCompare(right.publication.title))
    .slice(0, limit)
    .map((item) => item.publication);
}

function publicationIdentity(publication: PublicPublication, lang: Language) {
  const title = lang === "zh" ? localized(publication.titleZh, publication.title) : localized(publication.title, publication.titleZh);
  const alternateTitle = lang === "zh" ? compact(publication.title) : compact(publication.titleZh);
  return [
    `ID=${publication.id}`,
    `Title=${title}`,
    alternateTitle && alternateTitle !== title ? `Alternate title=${alternateTitle}` : "",
  ].filter(Boolean).join("; ");
}

function formatPublication(publication: PublicPublication, lang: Language, budget: number) {
  const identity = publicationIdentity(publication, lang);
  const metadata = [
    `Year=${publication.year}`,
    `Type=${publication.kind}`,
    publication.contributorRole === "editor" ? "Contribution=edited volume; editor" : "Contribution=author",
    `Authors=${publication.authors}`,
    `Venue=${publication.venue}`,
  ].filter(Boolean).join("; ");
  const keywords = compact((publication.keywords ?? []).join(", "));
  const abstract = lang === "zh"
    ? localized(publication.abstractZh, publication.abstract)
    : localized(publication.abstract, publication.abstractZh);
  const details = [metadata, keywords ? `Keywords=${keywords}` : "", abstract ? `Abstract=${abstract}` : ""].filter(Boolean).join("; ");
  const remaining = budget - identity.length - 2;
  return details && remaining > 40 ? `${identity}; ${truncate(details, remaining)}` : identity;
}

export function buildPublicKnowledgeText(input: KnowledgeInput) {
  const {lang, question, profile, publications, talks, people, courses} = input;
  const scholarText = profile.scholarMetrics
    ? `Citations: ${profile.scholarMetrics.citations}; h-index: ${profile.scholarMetrics.hIndex}; i10-index: ${profile.scholarMetrics.i10Index}; as of ${profile.scholarMetrics.asOf}.`
    : "Scholar metrics are not available in the current public profile.";

  const profileText = fitEntries("PUBLIC PROFILE", [
    `Name: ${profile.name || (lang === "zh" ? "范逸洲" : "Yizhou Fan")}`,
    `Position: ${profile.role}; ${profile.affiliation}.`,
    `Biography: ${profile.bio.join(" ")}`,
    `Public email: ${profile.email}`,
    `Research: ${profile.researchInterests.join(", ")}.`,
    `Research statement: ${profile.researchStatement}`,
    `Scholar metrics snapshot: ${scholarText}`,
    `Publications currently listed on this site: ${publications.length}`,
    ...profile.appointments.map((item) => `Appointment: ${item.year}; ${item.institution}; ${item.role}`),
    `Academic service: ${profile.academicService}`,
  ], sectionBudgets.profile);

  const teachingText = fitEntries("TEACHING", courses.map((item) => {
    const title = lang === "zh" ? localized(item.titleZh, item.title) : localized(item.title, item.titleZh);
    const nature = lang === "zh" ? localized(item.natureZh, item.nature) : localized(item.nature, item.natureZh);
    const description = lang === "zh" ? localized(item.descriptionZh, item.description) : localized(item.description, item.descriptionZh);
    const role = lang === "zh" ? localized(item.roleZh, item.role) : localized(item.role, item.roleZh);
    return [
      title,
      nature,
      role ? `${lang === "zh" ? "授课角色" : "Teaching role"}: ${role}` : "",
      item.offeredSince ? `${lang === "zh" ? "开设时间" : "Offered since"}: ${item.offeredSince}` : "",
      description,
    ].filter(Boolean).join("; ");
  }), sectionBudgets.teaching);

  const honorsText = fitEntries("HONORS AND AWARDS", profile.honors.map((item) => `${item.year}; ${item.title}`), sectionBudgets.honors);
  const projectsText = fitEntries("RESEARCH PROJECTS", profile.publicProjects.map((item) => `${item.year}; ${item.title}`), sectionBudgets.projects);
  const groupText = fitEntries("RESEARCH GROUP OVERVIEW", [
    `No official proper name for the research group is provided in the public material. Refer to it only as "the research group" or "the team" in English and "课题组" or "研究团队" in Chinese. Research areas documented on this site: ${profile.researchInterests.join(", ")}.`,
  ], sectionBudgets.group);

  const talksText = fitEntries("TALKS", talks.map((item) => {
    const title = lang === "zh" ? localized(item.titleZh, item.title) : localized(item.title, item.titleZh);
    const host = lang === "zh" ? localized(item.hostZh, item.host) : localized(item.host, item.hostZh);
    const summary = lang === "zh" ? localized(item.summaryZh, item.summary) : localized(item.summary, item.summaryZh);
    return [item.date, title, host, summary ? `${lang === "zh" ? "简介" : "Summary"}: ${summary}` : ""].filter(Boolean).join("; ");
  }), sectionBudgets.talks);

  const peopleText = fitEntries("PEOPLE", people.map((item) => {
    const name = lang === "zh" ? localized(item.nameZh, item.name) : localized(item.name, item.nameZh);
    const alternateName = lang === "zh" ? compact(item.name) : compact(item.nameZh);
    const position = lang === "zh" ? localized(item.positionZh, item.position) : localized(item.position, item.positionZh);
    const bio = lang === "zh" ? localized(item.bioZh, item.bio) : localized(item.bio, item.bioZh);
    return [
      alternateName ? `${name} / ${alternateName}` : name,
      position,
      item.enrollmentYear != null ? `${lang === "zh" ? "入学年份" : "Enrolled"} ${item.enrollmentYear}` : "",
      bio,
    ].filter(Boolean).join("; ");
  }), sectionBudgets.people);

  const coreText = [profileText, teachingText, honorsText, projectsText, groupText, talksText, peopleText].join("\n\n");
  const ranked = selectRelevantPublications(publications, question);
  const minimumPublicationBudget = PUBLIC_KNOWLEDGE_MAX_CHARS - coreText.length - 180;
  const selected = [...ranked];
  while (selected.length > 0) {
    const identityLength = selected.reduce((total, item) => total + publicationIdentity(item, lang).length + 1, 0);
    if (identityLength <= minimumPublicationBudget) break;
    selected.pop();
  }
  const publicationHeader = `PUBLICATIONS\nQuestion-selected publications: ${selected.length} of ${publications.length}. This is a relevant subset, not the complete publication list.`;
  const available = Math.max(0, PUBLIC_KNOWLEDGE_MAX_CHARS - coreText.length - publicationHeader.length - 4);
  const perPublication = selected.length > 0 ? Math.max(220, Math.floor((available - selected.length) / selected.length)) : 0;
  const publicationText = [publicationHeader, ...selected.map((item) => formatPublication(item, lang, perPublication))].join("\n");
  return `${coreText}\n\n${publicationText}`.slice(0, PUBLIC_KNOWLEDGE_MAX_CHARS);
}
