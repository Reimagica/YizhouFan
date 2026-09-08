import type { Language } from "../content";

export type GuardedAnswer = {
  status: "answered" | "insufficient";
  items: string[];
  note?: string;
  topics: Array<"profile" | "teaching" | "publications" | "talks" | "people">;
  publicationIds: string[];
};

const forcedClosings = [
  /更多详情可访问课题组相关公开页面或联系\s*fyz@pku\.edu\.cn[。.]?/giu,
  /(?:for )?more details[^.!?]*(?:public pages?|fyz@pku\.edu\.cn)[.!?]?/giu,
];

function normalizeNames(value: string, lang: Language) {
  return value
    .replace(/课题组\s*[（(]\s*FanLearn Lab\s*[）)]/giu, "课题组")
    .replace(/\bthe\s+FanLearn Lab\b/giu, lang === "zh" ? "课题组" : "the research group")
    .replace(/FanLearn Lab/giu, lang === "zh" ? "课题组" : "the research group")
    .replace(/范逸洲博士/gu, "范逸洲老师")
    .replace(/(?:博士范逸洲|范博士)/gu, "范逸洲老师")
    .replace(/\bDr\.?\s+Yizhou Fan\b/giu, "Yizhou Fan")
    .replace(/\bDr\.?\s+Fan\b/giu, "Yizhou Fan")
    .replace(/(^|[.!?]\s+)the research group/gu, "$1The research group");
}

function cleanText(value: unknown, lang: Language) {
  let text = typeof value === "string" ? value : "";
  for (const pattern of forcedClosings) text = text.replace(pattern, "");
  return normalizeNames(text, lang)
    .replace(/```(?:json)?|```/giu, "")
    .replace(/\*+|__|`/gu, "")
    .replace(/^\s*(?:[-*•]|\d+[.)])\s*/u, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function truncate(value: string, lang: Language, chineseCharacters: number, englishWords: number) {
  if (lang === "zh") {
    const characters = Array.from(value);
    return characters.length <= chineseCharacters ? value : `${characters.slice(0, chineseCharacters - 1).join("").replace(/[，、；：,.!?\s]+$/u, "")}…`;
  }
  const words = value.split(/\s+/u).filter(Boolean);
  return words.length <= englishWords ? value : `${words.slice(0, englishWords).join(" ").replace(/[,;:.!?\s]+$/u, "")}…`;
}

function fallbackItems(raw: string, lang: Language) {
  const lines = raw.replace(/```(?:json)?|```/giu, "").split(/\r?\n/u).map((item) => cleanText(item, lang)).filter(Boolean);
  if (lines.length > 1) return lines;
  return cleanText(raw, lang).split(/(?<=[。！？.!?])\s*/u).filter(Boolean);
}

export function guardAnswer(raw: string, lang: Language): GuardedAnswer {
  let status: GuardedAnswer["status"] = "answered";
  let values: unknown[] = [];
  let rawNote: unknown;
  let rawTopics: unknown;
  let rawPublicationIds: unknown;

  try {
    const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/giu, "")) as { status?: unknown; items?: unknown; note?: unknown; topics?: unknown; publicationIds?: unknown };
    status = parsed.status === "insufficient" ? "insufficient" : "answered";
    values = Array.isArray(parsed.items) ? parsed.items : [];
    rawNote = parsed.note;
    rawTopics = parsed.topics;
    rawPublicationIds = parsed.publicationIds;
  } catch {
    values = fallbackItems(raw, lang);
  }

  const items = values
    .map((item) => cleanText(item, lang))
    .filter(Boolean)
    .slice(0, 4)
    .map((item) => truncate(item, lang, 300, 150));
  const note = truncate(cleanText(rawNote, lang), lang, 90, 36);
  const allowedTopics = new Set(["profile", "teaching", "publications", "talks", "people"]);
  const topics = (Array.isArray(rawTopics) ? rawTopics : [])
    .filter((topic): topic is GuardedAnswer["topics"][number] => typeof topic === "string" && allowedTopics.has(topic))
    .slice(0, 4);
  const publicationIds = (Array.isArray(rawPublicationIds) ? rawPublicationIds : [])
    .map((id) => cleanText(id, lang))
    .filter(Boolean)
    .slice(0, 4)
    .map((id) => Array.from(id).slice(0, 180).join(""));

  if (items.length === 0) {
    return {
      status: "insufficient",
      items: [lang === "zh" ? "本站公开资料不足以可靠回答这个问题。" : "The public material on this site is insufficient to answer this reliably."],
      topics,
      publicationIds: [],
    };
  }
  return { status, items, ...(note ? { note } : {}), topics, publicationIds };
}
