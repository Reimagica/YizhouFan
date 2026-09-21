import type {Language} from "./content";
import type {PublicPerson} from "./cms/types";

function displayCategory(person: PublicPerson) {
  if (person.memberCategory) return person.memberCategory;
  if (person.memberRole === "postdoc") return "postdoc";
  if (person.memberRole === "phd" || person.memberRole === "masterToPhd") return "phd";
  if (person.memberRole === "master") return "master";
  if (person.memberRole === "other") return "visiting";
  if (person.memberRole === "graduated") return "alumni";
  return undefined;
}

const categoryLabels = {
  postdoc: {zh: "博士后", en: "Postdoctoral Fellow"},
  phd: {zh: "博士研究生", en: "Ph.D. student"},
  master: {zh: "硕士研究生", en: "Master’s student"},
  visiting: {zh: "访问学者", en: "Visiting Scholar"},
} as const;

const alumniIdentityLabels = {
  postdoc: {zh: "博士后", en: "Postdoctoral Fellow"},
  phd: {zh: "博士研究生", en: "Ph.D. student"},
  master: {zh: "硕士研究生", en: "Master’s student"},
  visiting: {zh: "访问学者", en: "Visiting Scholar"},
} as const;

function legacyGraduationYear(person: PublicPerson) {
  const zhMatch = person.positionZh?.match(/(19|20)\d{2}(?:届|级)?(?:博士|硕士)?毕业/u);
  const enMatch = person.position?.match(/(19|20)\d{2}\s+(?:Ph\.?D\.?|doctoral|Master['’]?s?)\s+Graduate/iu);
  const matched = zhMatch?.[0].match(/\d{4}/u)?.[0] ?? enMatch?.[0].match(/\d{4}/u)?.[0];
  return matched ? Number(matched) : undefined;
}

function legacyAlumniDegree(person: PublicPerson): PublicPerson["alumniDegree"] {
  const source = `${person.positionZh ?? ""} ${person.position ?? ""}`;
  if (/博士毕业|Ph\.?D\.?\s+Graduate|doctoral graduate/iu.test(source)) return "phd";
  if (/硕士毕业|Master['’]?s?\s+Graduate/iu.test(source)) return "master";
  return undefined;
}

export function localizedPersonPosition(person: PublicPerson, lang: Language) {
  const category = displayCategory(person);
  if (!category) return undefined;

  if (category === "alumni") {
    const year = person.enrollmentYear ?? legacyGraduationYear(person);
    const identity = person.alumniIdentity ?? person.alumniDegree ?? legacyAlumniDegree(person);
    if (!year || !identity) return lang === "zh" ? "毕业生" : "Alumnus";
    const label = alumniIdentityLabels[identity];
    return lang === "zh" ? `${year}级${label.zh}` : `${year} cohort · ${label.en}`;
  }

  const year = person.enrollmentYear;
  const label = categoryLabels[category];
  if (!year) return label[lang];
  return lang === "zh" ? `${year}级${label.zh}` : `${year} cohort · ${label.en}`;
}

export function localizedAlumniDestination(person: PublicPerson, lang: Language) {
  const direct = lang === "zh"
    ? person.destinationZh?.trim() || person.destination?.trim()
    : person.destination?.trim() || person.destinationZh?.trim();
  if (direct) return direct;

  // Compatibility for the pre-migration alumni record, whose destination was
  // historically stored after a middle dot in the free-text position.
  const legacy = lang === "zh" ? person.positionZh : person.position;
  const parts = legacy?.split(/\s*[·;]\s*/u).filter(Boolean);
  return parts && parts.length > 1 ? parts.slice(1).join(" · ") : undefined;
}
