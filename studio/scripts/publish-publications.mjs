// Publish verified publication drafts.
//
// Publishes a publication document only when ALL of the following hold:
//   - status == "draft"
//   - reviewNote is empty (i.e. the extraction agent did not flag it for manual review)
// Drafts that carry a reviewNote are left untouched so the mentor can review them in Studio.
//
// Idempotent: re-running only flips any remaining drafts-without-reviewNote. Already-published
// docs (the existing 12, plus anything previously published here) are not touched.
//
// Auth: sanity/cli getCliClient (cached login).
// Run:  npm run publish:publications   (from studio/)

import {getCliClient} from "sanity/cli";

const client = getCliClient({apiVersion: "2025-02-19"});

const docs = await client.fetch(`*[_type == "publication"] | order(year desc, title.en asc){
  _id, status, reviewNote, "title": title.en, "titleZh": title.zh, year
}`);

const toPublish = docs.filter((d) => d.status === "draft" && !d.reviewNote);
const keptDraft = docs.filter((d) => d.status === "draft" && d.reviewNote);
const alreadyPublished = docs.filter((d) => d.status === "published");

if (toPublish.length === 0) {
  console.log("Nothing to publish: no draft-without-reviewNote publications remain.");
} else {
  const tx = client.transaction();
  for (const doc of toPublish) {
    tx.patch(doc._id, (p) => p.set({status: "published"}));
  }
  const commit = await tx.commit({visibility: "sync"});
  console.log(`Published ${toPublish.length} publication(s) in transaction ${commit.transactionId}.`);
  for (const doc of toPublish) {
    console.log(`  published: ${doc._id} — ${doc.year} ${doc.title || doc.titleZh || ""}`);
  }
}

console.log(`Kept as draft (has reviewNote): ${keptDraft.length}`);
for (const doc of keptDraft) {
  console.log(`  draft: ${doc._id} — ${doc.year} ${doc.title || doc.titleZh || ""}`);
}
console.log(`Already published (untouched): ${alreadyPublished.length}`);
console.log(`Total publication docs: ${docs.length}`);
