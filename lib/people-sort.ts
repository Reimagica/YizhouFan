import type {Language} from "./content";
import type {PublicPerson} from "./cms/types";

// Stable, language-aware sort for team members. Does not rely on Sanity return order.
// 1. Members with an enrollment year come first.
// 2. Enrollment year descending (most recent first).
// 3. Within the same year, `order` ascending (smaller first).
// 4. Then by the display name for the current language.
// 5. Members without an enrollment year sort to the end, by display name.
export function sortPeople(people: PublicPerson[], lang: Language): PublicPerson[] {
  const locale = lang === "zh" ? "zh-Hans" : "en";
  const nameOf = (person: PublicPerson) => (lang === "zh" ? person.nameZh || person.name : person.name || person.nameZh);
  const byName = (a: PublicPerson, b: PublicPerson) => nameOf(a).localeCompare(nameOf(b), locale);

  const withYear = people.filter((person) => person.enrollmentYear != null);
  const withoutYear = people.filter((person) => person.enrollmentYear == null);

  const withYearSorted = [...withYear].sort((a, b) =>
    ((b.enrollmentYear as number) - (a.enrollmentYear as number))
    || ((a.order ?? 0) - (b.order ?? 0))
    || byName(a, b),
  );
  const withoutYearSorted = [...withoutYear].sort(byName);
  return [...withYearSorted, ...withoutYearSorted];
}
