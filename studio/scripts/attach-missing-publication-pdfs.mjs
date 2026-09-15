// Attaches the two user-confirmed public PDFs to their existing published
// publication documents. The source paths are explicit environment inputs so
// private local directories never become repository data.
//
// Dry run:
//   COMMUNICATIONS_PDF=<absolute-path> GENERATIVE_AI_PDF=<absolute-path> \
//     npm --prefix studio run attach:missing-publication-pdfs
// Apply:
//   ATTACH_MISSING_PUBLICATION_PDFS=1 COMMUNICATIONS_PDF=<absolute-path> \
//     GENERATIVE_AI_PDF=<absolute-path> npm --prefix studio run attach:missing-publication-pdfs

import {createReadStream} from "node:fs";
import {access, stat} from "node:fs/promises";
import {basename} from "node:path";
import {getCliClient} from "sanity/cli";

const APPLY = process.env.ATTACH_MISSING_PUBLICATION_PDFS === "1";
const entries = [
  {
    id: "publication-001",
    expectedTitle: "A Metacognitive Approach to Learning and Performance in Human-AI Interaction",
    sourcePath: process.env.COMMUNICATIONS_PDF,
  },
  {
    id: "publication-008",
    expectedTitle: "Learning with Generative Artificial Intelligence: What Empirical Studies Tell Us",
    sourcePath: process.env.GENERATIVE_AI_PDF,
  },
];

for (const entry of entries) {
  if (!entry.sourcePath) throw new Error(`${entry.id}: source PDF environment variable is required`);
  await access(entry.sourcePath);
  const info = await stat(entry.sourcePath);
  if (!info.isFile() || info.size === 0 || info.size > 40 * 1024 * 1024) {
    throw new Error(`${entry.id}: PDF must be a non-empty file no larger than 40 MB`);
  }
}

const client = getCliClient({apiVersion: "2025-02-19"});
const existing = await client.fetch(
  `*[_id in $ids]{_id, status, title, "hasFile": defined(publicFile.file.asset), "copyrightCleared": publicFile.copyrightCleared}`,
  {ids: entries.map((entry) => entry.id)},
);
const byId = new Map(existing.map((document) => [document._id, document]));

for (const entry of entries) {
  const document = byId.get(entry.id);
  if (!document) throw new Error(`${entry.id}: publication not found`);
  if (document.status !== "published") throw new Error(`${entry.id}: expected published status`);
  if (document.title?.en !== entry.expectedTitle) throw new Error(`${entry.id}: title does not match the intended publication`);
}

const pending = entries.filter((entry) => !byId.get(entry.id)?.hasFile);
if (!pending.length) {
  console.log("Both publication documents already have PDF assets. Nothing to do.");
  process.exit(0);
}

console.log(`${APPLY ? "Applying" : "Dry run"}: ${pending.map((entry) => entry.id).join(", ")}`);
for (const entry of pending) {
  const info = await stat(entry.sourcePath);
  console.log(`  ${entry.id}: ${basename(entry.sourcePath)} (${info.size} bytes)`);
}
if (!APPLY) {
  console.log("No files uploaded. Set ATTACH_MISSING_PUBLICATION_PDFS=1 to apply.");
  process.exit(0);
}

const uploaded = [];
for (const entry of pending) {
  const asset = await client.assets.upload("file", createReadStream(entry.sourcePath), {
    filename: basename(entry.sourcePath),
    contentType: "application/pdf",
  });
  const assetId = asset._id || asset.id || asset._ref;
  if (!assetId) throw new Error(`${entry.id}: upload did not return an asset id`);
  uploaded.push({entry, assetId});
}

const transaction = client.transaction();
for (const {entry, assetId} of uploaded) {
  transaction.patch(entry.id, (patch) => patch.set({
    publicFile: {
      file: {asset: {_type: "reference", _ref: assetId}},
      copyrightCleared: true,
    },
  }));
}
const result = await transaction.commit({visibility: "sync"});
console.log(`Attached ${uploaded.length} PDF asset(s) in transaction ${result.transactionId}.`);

const verified = await client.fetch(
  `*[_id in $ids]{_id, "mime": publicFile.file.asset->mimeType, "url": publicFile.file.asset->url, "copyrightCleared": publicFile.copyrightCleared}`,
  {ids: uploaded.map(({entry}) => entry.id)},
);
for (const document of verified) {
  if (document.mime !== "application/pdf" || !document.url || document.copyrightCleared !== true) {
    throw new Error(`${document._id}: attachment verification failed after write`);
  }
  console.log(`${document._id}: ${document.url}`);
}
