import type {Language} from "../content";
import type {PublicPublication} from "../cms/types";

export type AnswerTopic = "profile" | "teaching" | "publications" | "talks" | "people";
export type AnswerLink = {label: string; url: string};

const siteSections = [
  {label: "Personal profile", labelZh: "个人信息", url: "/en"},
  {label: "Teaching", labelZh: "教学", url: "/en/teaching"},
  {label: "Publications", labelZh: "学术成果", url: "/en/publications"},
  {label: "Talks", labelZh: "学术报告", url: "/en/talks"},
  {label: "People", labelZh: "团队成员", url: "/en/people"},
];

export function selectPublicSources(question: string, lang: Language, topics: AnswerTopic[] = []): AnswerLink[] {
  const query = question.toLowerCase();
  const indexes: number[] = [];
  const add = (index: number) => {
    if (!indexes.includes(index)) indexes.push(index);
  };

  if (topics.includes("profile") || /award|honou?r|project|position|bio|contact|email|research|scholar|citation|h-index|i10|研究|荣誉|奖励|项目|任职|简介|联系|邮箱|引用/u.test(query)) add(0);
  if (topics.includes("teaching") || /teach|course|class|curriculum|教学|课程|授课/u.test(query)) add(1);
  if (topics.includes("publications") || /publication|paper|article|book|wrote|written|authored|论文|成果|著作|文章|期刊|会议/u.test(query)) add(2);
  if (topics.includes("talks") || /talk|keynote|lecture|presentation|报告|演讲|讲座|课件/u.test(query)) add(3);
  if (topics.includes("people") || /student|member|team|lab|课题组|团队|成员|学生|博士后/u.test(query)) add(4);
  if (indexes.length === 0) add(0);

  return indexes.slice(0, 4).map((index) => {
    const source = siteSections[index];
    return {
      label: lang === "zh" ? source.labelZh : source.label,
      url: source.url.replace("/en", `/${lang}`),
    };
  });
}

function publicationUrl(publication: PublicPublication) {
  if (publication.sourceUrl) return publication.sourceUrl;
  if (publication.doi) return `https://doi.org/${publication.doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//iu, "")}`;
  if (publication.pdfUrl) return publication.pdfUrl;
  return null;
}

function normalized(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

export function selectPublicationLinks(publications: PublicPublication[], publicationIds: string[], answerText: string, question: string, lang: Language): AnswerLink[] {
  const requested = new Set(publicationIds);
  const haystack = normalized(`${question} ${answerText}`);
  return publications
    .filter((publication) => requested.has(publication.id)
      || [publication.title, publication.titleZh ?? ""].some((title) => {
        const candidate = normalized(title);
        return candidate.length >= 10 && haystack.includes(candidate);
      }))
    .flatMap((publication) => {
      const url = publicationUrl(publication);
      return url ? [{
        label: lang === "zh" && publication.titleZh ? publication.titleZh : publication.title,
        url,
      }] : [];
    })
    .slice(0, 4);
}

function truncateAnswerItem(value: string, lang: Language) {
  if (lang === "zh") {
    const characters = Array.from(value);
    return characters.length <= 300 ? value : `${characters.slice(0, 299).join("").replace(/[，、；：,.!?\s]+$/u, "")}…`;
  }
  const words = value.split(/\s+/u).filter(Boolean);
  return words.length <= 150 ? value : `${words.slice(0, 150).join(" ").replace(/[,;:.!?\s]+$/u, "")}…`;
}

export function ensurePublicationTitles(items: string[], publications: PublicPublication[], publicationIds: string[], lang: Language) {
  const requested = publicationIds
    .map((id) => publications.find((publication) => publication.id === id))
    .filter((publication): publication is PublicPublication => Boolean(publication));
  const result = [...items];

  requested.forEach((publication, publicationIndex) => {
    const title = lang === "zh" && publication.titleZh ? publication.titleZh : publication.title;
    if (result.some((item) => normalized(item).includes(normalized(title)))) return;
    const prefix = lang === "zh" ? `《${title}》：` : `${title}: `;
    if (result.length === 0 || (publicationIndex >= result.length && result.length < 4)) {
      result.push(title);
      return;
    }
    const targetIndex = Math.min(publicationIndex, result.length - 1);
    result[targetIndex] = truncateAnswerItem(`${prefix}${result[targetIndex]}`, lang);
  });

  return result.slice(0, 4);
}
