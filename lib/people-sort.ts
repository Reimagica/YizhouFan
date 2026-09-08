import type {Language} from "./content";
import type {PublicPerson} from "./cms/types";

const roleRanks: Record<NonNullable<PublicPerson["memberRole"]>, number> = {
  phd: 0,
  masterToPhd: 1,
  master: 2,
  graduated: 3,
};

// Published records created before `memberRole` was introduced remain sortable until
// the field is backfilled in Sanity. Graduation is checked first because an alumnus'
// display text may also mention a current doctoral programme elsewhere.
export function personRoleRank(person: PublicPerson): number {
  if (person.memberRole) return roleRanks[person.memberRole];

  const position = `${person.positionZh ?? ""} ${person.position ?? ""}`.toLocaleLowerCase();
  if (/毕业|校友|alumn/u.test(position)) return roleRanks.graduated;
  if (/硕转博|硕博连读|master(?:'s)?[- ]to[- ](?:phd|doctoral)|master.*doctoral/u.test(position)) return roleRanks.masterToPhd;
  if (/博士研究生|博士生|ph\.?d\.? student|doctoral student/u.test(position)) return roleRanks.phd;
  if (/硕士研究生|硕士生|master(?:'s)? student/u.test(position)) return roleRanks.master;
  return 4;
}

// Stable, language-aware sort for team members. Does not rely on Sanity return order.
// 1. Members with an enrollment year come first.
// 2. Enrollment year descending (most recent first).
// 3. Within the same year: PhD, master's-to-PhD, master's, graduated, then legacy roles.
// 4. Then by the display name for the current language.
// 5. Members without an enrollment year sort to the end using the same role/name rules.
export function sortPeople(people: PublicPerson[], lang: Language): PublicPerson[] {
  const locale = lang === "zh" ? "zh-Hans" : "en";
  const nameOf = (person: PublicPerson) => (lang === "zh" ? person.nameZh || person.name : person.name || person.nameZh);
  const byName = (a: PublicPerson, b: PublicPerson) => nameOf(a).localeCompare(nameOf(b), locale);

  const withYear = people.filter((person) => person.enrollmentYear != null);
  const withoutYear = people.filter((person) => person.enrollmentYear == null);

  const withYearSorted = [...withYear].sort((a, b) =>
    ((b.enrollmentYear as number) - (a.enrollmentYear as number))
    || (personRoleRank(a) - personRoleRank(b))
    || byName(a, b),
  );
  const withoutYearSorted = [...withoutYear].sort((a, b) =>
    (personRoleRank(a) - personRoleRank(b)) || byName(a, b),
  );
  return [...withYearSorted, ...withoutYearSorted];
}
