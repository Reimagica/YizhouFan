import {getCliClient} from "sanity/cli";

const apply = process.env.PEOPLE_MIGRATION_APPLY === "1";
const client = getCliClient({apiVersion: "2026-09-01"});

const categoryByLegacyRole = {
  postdoc: "postdoc",
  phd: "phd",
  masterToPhd: "phd",
  master: "master",
  other: "visiting",
  graduated: "alumni",
};

const confirmedAlumni = {
  "person-009": {
    enrollmentYear: 2023,
    alumniIdentity: "master",
    destination: {
      zh: "香港大学教育学院2026级博士生",
      en: "2026 cohort Ph.D. student at the Faculty of Education, The University of Hong Kong",
    },
  },
};

const people = await client.fetch(`*[_type == "person"] | order(_id asc) {
  _id,
  name,
  memberCategory,
  memberRole,
  enrollmentYear,
  alumniIdentity,
  alumniDegree,
  destination
}`, {}, {perspective: "raw"});

const publishedById = new Map(
  people.filter((person) => !person._id.startsWith("drafts.")).map((person) => [person._id, person]),
);

const plans = people.map((person) => {
  const publishedId = person._id.replace(/^drafts\./u, "");
  const published = publishedById.get(publishedId);
  const category = person.memberCategory
    ?? published?.memberCategory
    ?? categoryByLegacyRole[published?.memberRole]
    ?? categoryByLegacyRole[person.memberRole];
  if (!category) throw new Error(`Cannot classify ${person._id}; add an explicit migration rule before applying.`);
  if (!Number.isInteger(person.enrollmentYear)) {
    throw new Error(`${person._id} is missing enrollmentYear.`);
  }

  const set = {memberCategory: category};
  const unset = ["position", "positionMode", "memberRole", "order", "category"];
  if (category === "alumni") {
    const confirmed = confirmedAlumni[publishedId] ?? (
      (person.alumniIdentity || person.alumniDegree) && person.destination?.zh && person.destination?.en
        ? {
            alumniIdentity: person.alumniIdentity ?? person.alumniDegree,
            destination: person.destination,
          }
        : undefined
    );
    if (!confirmed) throw new Error(`${person._id} requires a confirmed enrollment year, degree type, and bilingual destination.`);
    Object.assign(set, confirmed);
    unset.push("graduationYear", "alumniDegree");
  } else {
    unset.push("graduationYear", "alumniDegree", "destination");
  }
  return {_id: person._id, name: person.name, set, unset};
});

console.log(JSON.stringify({mode: apply ? "apply" : "dry-run", count: plans.length, plans}, null, 2));

if (!apply) {
  console.log("Dry run only. Set PEOPLE_MIGRATION_APPLY=1 to apply the reviewed migration.");
} else {
  let transaction = client.transaction();
  for (const plan of plans) {
    transaction = transaction.patch(plan._id, (patch) => patch.set(plan.set).unset(plan.unset));
  }
  const result = await transaction.commit({visibility: "sync"});
  console.log(`Migrated ${plans.length} people in transaction ${result.transactionId}.`);
}
