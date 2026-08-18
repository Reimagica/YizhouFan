import {readFile} from "node:fs/promises";
import {getCliClient} from "sanity/cli";

const inputPath = process.env.MIGRATION_INPUT ?? "/private/tmp/yizhoufan-0817-content.ndjson";
const rows = (await readFile(inputPath, "utf8"))
  .split(/\r?\n/u)
  .filter(Boolean)
  .map((row) => JSON.parse(row));
const profileSource = rows.find((document) => document._type === "profile");
const courseSources = rows.filter((document) => document._type === "course");
if (!profileSource || courseSources.length !== 5) throw new Error("Expected one profile and five course documents in the migration input");

const client = getCliClient({apiVersion: "2025-02-19"});
const profileId = await client.fetch('*[_type == "profile" && status == "published"][0]._id');
if (!profileId) throw new Error("Published profile document was not found");

const transaction = client.transaction().patch(profileId, (patch) => patch.set({
  bio: profileSource.bio,
  researchStatement: profileSource.researchStatement,
  researchInterests: profileSource.researchInterests,
  appointments: profileSource.appointments,
  publicProjects: profileSource.publicProjects,
  scholarMetrics: profileSource.scholarMetrics,
}));

for (const source of courseSources) {
  transaction.createIfNotExists({_id: source._id, _type: "course"});
  const fields = {...source};
  delete fields._id;
  delete fields._type;
  transaction.patch(source._id, (patch) => patch.set(fields));
}

const result = await transaction.commit({visibility: "sync"});
console.log(`Updated profile ${profileId} and ${courseSources.length} published course documents in transaction ${result.transactionId}.`);
