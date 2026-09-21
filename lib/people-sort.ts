import type {Language} from "./content";
import type {PublicPerson} from "./cms/types";

export const PERSON_CATEGORIES = ["postdoc", "phd", "master", "visiting", "alumni"] as const;
export type PersonCategory = (typeof PERSON_CATEGORIES)[number];

export const PERSON_CATEGORY_LABELS: Record<PersonCategory, {en: string; zh: string}> = {
  postdoc: {en: "Postdoctoral Fellows", zh: "博士后"},
  phd: {en: "Ph.D. Students", zh: "博士研究生"},
  master: {en: "Master’s Students", zh: "硕士研究生"},
  visiting: {en: "Visiting Scholars", zh: "访问学者"},
  alumni: {en: "Alumni", zh: "毕业生"},
};

const legacyRoleCategories: Record<NonNullable<PublicPerson["memberRole"]>, PersonCategory> = {
  postdoc: "postdoc",
  phd: "phd",
  masterToPhd: "phd",
  master: "master",
  graduated: "alumni",
  other: "visiting",
};

// Existing published documents continue to render correctly while the new
// category field is being backfilled in Sanity.
export function personCategory(person: PublicPerson): PersonCategory | undefined {
  if (person.memberCategory) return person.memberCategory;
  if (person.memberRole) return legacyRoleCategories[person.memberRole];

  const position = `${person.positionZh ?? ""} ${person.position ?? ""}`.toLocaleLowerCase();
  if (/博士后|postdoc|post-doctor/u.test(position)) return "postdoc";
  if (/毕业|校友|alumn|graduate/u.test(position)) return "alumni";
  if (/访问学者|visiting scholar/u.test(position)) return "visiting";
  if (/硕转博|硕博连读|博士研究生|博士生|ph\.?d\.? student|doctoral student/u.test(position)) return "phd";
  if (/硕士研究生|硕士生|master(?:'s|’s)? student/u.test(position)) return "master";
  return undefined;
}

export function personSortYear(person: PublicPerson): number | undefined {
  return person.enrollmentYear;
}

export function sortPeopleInCategory(people: PublicPerson[], lang: Language): PublicPerson[] {
  const locale = lang === "zh" ? "zh-Hans-u-co-pinyin" : "en";
  const nameOf = (person: PublicPerson) => lang === "zh" ? person.nameZh || person.name : person.name || person.nameZh;

  return [...people].sort((a, b) => {
    const yearA = personSortYear(a);
    const yearB = personSortYear(b);
    if (yearA == null && yearB != null) return 1;
    if (yearA != null && yearB == null) return -1;
    if (yearA != null && yearB != null && yearA !== yearB) return yearB - yearA;
    return nameOf(a).localeCompare(nameOf(b), locale, {sensitivity: "base"});
  });
}

export function groupPeople(people: PublicPerson[], lang: Language) {
  return PERSON_CATEGORIES.map((category) => ({
    category,
    label: PERSON_CATEGORY_LABELS[category][lang],
    people: sortPeopleInCategory(
      people.filter((person) => personCategory(person) === category),
      lang,
    ),
  }));
}

// Kept as a small public utility for callers that need the same order without
// rendering the section wrappers.
export function sortPeople(people: PublicPerson[], lang: Language): PublicPerson[] {
  return groupPeople(people, lang).flatMap((group) => group.people);
}
