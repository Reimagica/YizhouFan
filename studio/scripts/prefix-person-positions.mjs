import {getCliClient} from "sanity/cli";

const client = getCliClient({apiVersion: "2025-08-01"});
const people = await client.fetch(`*[_type == "person" && status == "published" && defined(enrollmentYear) && defined(position)]{_id, enrollmentYear, memberRole, position}`);
const patches = [];

for (const person of people) {
  const year = person.enrollmentYear;
  const zh = person.position?.zh?.trim();
  const en = person.position?.en?.trim();
  const withoutZhCohort = zh?.replace(new RegExp(`^${year}级(?:\\s*·\\s*)?`, "u"), "");
  const withoutEnCohort = en?.replace(new RegExp(`^${year} cohort(?:\\s*·\\s*)?`, "iu"), "");
  const isUnprefixedRole = person.memberRole === "graduated" || person.memberRole === "other";
  const nextZh = isUnprefixedRole
    ? withoutZhCohort
    : withoutZhCohort && (/^[博士硕].*(?:生|后)|^(?:硕转博)$/u.test(withoutZhCohort) ? `${year}级${withoutZhCohort}` : `${year}级 · ${withoutZhCohort}`);
  const nextEn = isUnprefixedRole ? withoutEnCohort : withoutEnCohort && `${year} cohort · ${withoutEnCohort}`;
  if (nextZh !== zh || nextEn !== en) patches.push(client.patch(person._id).set({position: {zh: nextZh, en: nextEn}}));
}

if (patches.length > 0) await Promise.all(patches.map((patch) => patch.commit({visibility: "sync"})));
console.log(`Updated ${patches.length} person position field(s).`);
