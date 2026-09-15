import type {Language} from "./content";
import type {PublicPerson} from "./cms/types";

const simpleChinesePositions = new Set(["博士后", "博士生", "博士研究生", "硕转博", "硕士生", "硕士研究生", "已毕业", "毕业生"]);

export function localizedPersonPosition(person: PublicPerson, lang: Language) {
  const position = (lang === "zh" ? (person.positionZh || person.position) : (person.position || person.positionZh))?.trim();
  if (!position || person.enrollmentYear == null || person.memberRole === "graduated" || person.memberRole === "other") return position;

  if (lang === "zh") {
    const cohort = `${person.enrollmentYear}级`;
    if (position.startsWith(cohort)) return position;
    return simpleChinesePositions.has(position) ? `${cohort}${position}` : `${cohort} · ${position}`;
  }

  const cohort = `${person.enrollmentYear} cohort`;
  return position.toLocaleLowerCase().startsWith(cohort.toLocaleLowerCase()) ? position : `${cohort} · ${position}`;
}
