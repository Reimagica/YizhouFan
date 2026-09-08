import {getCliClient} from "sanity/cli";

const apply = process.env.PATCH_APPLY === "1";
const client = getCliClient({apiVersion: "2026-09-01"});
const ids = ["publication-008", "talk-004", "course-academic-writing-ai"];
const docs = await client.fetch(`*[_id in $ids]{_id, _rev, contributorRole, bibtex, host, mooc, moocUrl}`, {ids});
const byId = new Map(docs.map((doc) => [doc._id, doc]));
const expected = {
  "publication-008": {contributorRole: "editor"},
  "talk-004": {"host.en": "University College London (UCL), UK"},
  "course-academic-writing-ai": {mooc: true, moocUrl: "https://www.icourse163.org/course/PKU-1449486161"},
};

const getCurrent = (doc, path) => path.split(".").reduce((value, key) => value?.[key], doc);
const transaction = client.transaction();
const changes = [];
for (const id of ids) {
  const doc = byId.get(id);
  if (!doc) throw new Error(`Missing document ${id}`);
  const set = {};
  for (const [path, value] of Object.entries(expected[id])) {
    if (getCurrent(doc, path) !== value) set[path] = value;
  }
  if (Object.keys(set).length) {
    transaction.patch(id, (patch) => patch.set(set));
    changes.push({id, set: Object.keys(set)});
  }
}

console.log(JSON.stringify({apply, changes}, null, 2));
if (apply && changes.length) {
  const result = await transaction.commit({visibility: "sync"});
  console.log(JSON.stringify({transactionId: result.transactionId}, null, 2));
} else if (!apply) {
  console.log("DRY RUN: set PATCH_APPLY=1 to apply these exact patches.");
}
