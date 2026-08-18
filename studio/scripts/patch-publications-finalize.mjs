// One-off but idempotent finalization patcher for the 8 remaining custom-status
// draft publications. Applies the 3 metadata corrections (verbatim OCR abstracts
// + cleaned citation fields + explicit Book-chapter BibTeX) and publishes all 8
// (status = published, reviewNote unset). Does NOT re-upload PDFs, create assets,
// or touch copyrightCleared.
//
// Inputs (env):
//   FINALIZATION_INPUT  — absolute path to finalization-input.json (corrections + publishIds).
//                          Lives outside the repo (private audit dir); path via env, never hardcoded.
//   PATCH_APPLY=1       — commit; otherwise dry-run.
//
// Safety:
//   - Only the 8 IDs in publishIds are touched; any correction ID not in publishIds aborts.
//   - Pre-commit gate: every one of the 8 must have a PDF asset, MIME application/pdf,
//     and copyrightCleared=true. Any failure aborts the whole run.
//   - Correction validation gate: each corrected doc must end up with non-empty
//     authors, a non-empty title (en or zh), a non-empty venue, and a non-empty
//     doi OR sourceUrl. Any failure aborts.
//   - Single transaction; re-run is a no-op (only patches fields that differ).
//
// Run (dry-run):  FINALIZATION_INPUT=... npm --prefix studio run patch:publications:finalize
// Run (apply):    FINALIZATION_INPUT=... PATCH_APPLY=1 npm --prefix studio run patch:publications:finalize

import {readFile} from "node:fs/promises";
import {getCliClient} from "sanity/cli";

const INPUT = process.env.FINALIZATION_INPUT;
if (!INPUT) {
  console.error("FINALIZATION_INPUT env var is required (absolute path to finalization-input.json).");
  console.error("The input lives outside this repo; its path must not be hardcoded.");
  process.exit(1);
}
const APPLY = process.env.PATCH_APPLY === "1";

const cfg = JSON.parse(await readFile(INPUT, "utf8"));
const corrections = new Map(cfg.corrections.map((c) => [c.id, c]));
const publishIds = cfg.publishIds;
if (!Array.isArray(publishIds) || publishIds.length !== 8) {
  console.error(`publishIds must be an array of 8 IDs (got ${Array.isArray(publishIds) ? publishIds.length : "non-array"})`);
  process.exit(1);
}
for (const c of cfg.corrections) {
  if (!publishIds.includes(c.id)) {
    console.error(`correction id ${c.id} is not in publishIds — aborting`);
    process.exit(1);
  }
}

const client = getCliClient({apiVersion: "2025-02-19"});
const docs = await client.fetch(
  `*[_id in $ids]{
    _id, status, reviewNote, kind, language, authors, year, venue, volume, issue,
    pages, articleNumber, doi, sourceUrl, keywords, bibtex, title, abstract,
    "hasFile": defined(publicFile.file.asset),
    "fileMime": publicFile.file.asset->mimeType,
    "copyrightCleared": publicFile.copyrightCleared
  }`,
  {ids: publishIds}
);
const byId = new Map(docs.map((d) => [d._id, d]));

const norm = (s) => (s == null ? "" : typeof s === "string" ? s : JSON.stringify(s));

// Pre-commit gate: PDF asset + MIME + copyrightCleared for all 8.
const assetFailures = [];
for (const id of publishIds) {
  const d = byId.get(id);
  if (!d) { assetFailures.push(`${id}: not found in Sanity`); continue; }
  if (!d.hasFile) assetFailures.push(`${id}: no PDF asset attached`);
  else if (d.fileMime !== "application/pdf") assetFailures.push(`${id}: PDF MIME is ${d.fileMime}`);
  if (!d.copyrightCleared) assetFailures.push(`${id}: copyrightCleared is not true`);
}
if (assetFailures.length) {
  console.error("Asset pre-check failures (no writes performed):");
  for (const f of assetFailures) console.error("  " + f);
  process.exit(1);
}

const tx = client.transaction();
const report = [];
let corrPlanned = 0, pubPlanned = 0;
const validationFailures = [];

for (const id of publishIds) {
  const cur = byId.get(id);
  const corr = corrections.get(id);
  const setFields = {};
  const unsetFields = [];

  if (corr) {
    const f = corr.fields;
    // title (localized)
    if (f.title) {
      if (f.title.en !== undefined && norm(f.title.en) !== norm(cur.title?.en)) setFields["title.en"] = f.title.en;
      if (f.title.zh !== undefined && norm(f.title.zh) !== norm(cur.title?.zh)) setFields["title.zh"] = f.title.zh;
    }
    // abstract (localized)
    if (f.abstract) {
      if (f.abstract.en !== undefined && norm(f.abstract.en) !== norm(cur.abstract?.en)) setFields["abstract.en"] = f.abstract.en;
      if (f.abstract.zh !== undefined && norm(f.abstract.zh) !== norm(cur.abstract?.zh)) setFields["abstract.zh"] = f.abstract.zh;
    }
    // keywords (array — compare by JSON)
    if (f.keywords !== undefined && JSON.stringify(f.keywords) !== JSON.stringify(cur.keywords || [])) {
      setFields.keywords = f.keywords;
    }
    // bibtex (text)
    if (f.bibtex !== undefined && norm(f.bibtex) !== norm(cur.bibtex || "")) {
      setFields.bibtex = f.bibtex;
    }
    // flat scalar fields
    for (const [field, val] of Object.entries(f)) {
      if (field === "title" || field === "abstract" || field === "keywords" || field === "bibtex") continue;
      if (norm(val) !== norm(cur[field])) setFields[field] = val;
    }
    // unsets (dotted paths supported)
    for (const u of corr.unset || []) {
      const parts = u.split(".");
      const curVal = parts.length === 2 ? cur[parts[0]]?.[parts[1]] : cur[parts[0]];
      if (curVal != null) unsetFields.push(u);
    }
    if (Object.keys(setFields).length || unsetFields.length) corrPlanned++;
  }

  // Publish: status=published + unset reviewNote
  if (cur.status !== "published") { setFields.status = "published"; pubPlanned++; }
  if (cur.reviewNote) unsetFields.push("reviewNote");

  // Correction validation gate (post-patch state must satisfy authors/title/venue/doi-or-sourceUrl).
  if (corr) {
    const f = corr.fields;
    const after = (field, dotted) => {
      if (corr.unset?.includes(dotted || field)) return null;
      const v = dotted ? f[dotted.split(".")[0]]?.[dotted.split(".")[1]] : f[field];
      return v !== undefined ? v : (dotted ? cur[dotted.split(".")[0]]?.[dotted.split(".")[1]] : cur[field]);
    };
    const authors = after("authors");
    const titleEn = after("title", "title.en");
    const titleZh = f.title?.zh !== undefined ? f.title.zh : cur.title?.zh;
    const venue = after("venue");
    const doi = after("doi", "doi");
    const sourceUrl = f.sourceUrl !== undefined ? f.sourceUrl : cur.sourceUrl;
    if (!authors) validationFailures.push(`${id}: authors empty after patch`);
    if (!titleEn && !titleZh) validationFailures.push(`${id}: title empty after patch`);
    if (!venue) validationFailures.push(`${id}: venue empty after patch`);
    if (!doi && !sourceUrl) validationFailures.push(`${id}: neither doi nor sourceUrl after patch`);
  }

  if (Object.keys(setFields).length || unsetFields.length) {
    tx.patch(id, (p) => {
      if (Object.keys(setFields).length) p.set(setFields);
      if (unsetFields.length) p.unset(unsetFields);
      return p;
    });
    report.push({id, action: APPLY ? "patched" : "would-patch", set: Object.keys(setFields), unset: [...unsetFields]});
  } else {
    report.push({id, action: "no-op", set: [], unset: []});
  }
}

if (validationFailures.length) {
  console.error("Correction validation gate failures (no writes performed):");
  for (const f of validationFailures) console.error("  " + f);
  process.exit(1);
}

console.log(`\nPlanned: ${corrPlanned} correction patches, ${pubPlanned} status flips.`);
if (!APPLY) {
  console.log("DRY RUN — set PATCH_APPLY=1 to commit. No changes written.");
  console.log("\nPer-doc changes (id → set/unset):");
  for (const r of report.filter((x) => x.action !== "no-op")) {
    console.log(`  ${r.id}: set=${r.set.join(",") || "-"} unset=${r.unset.join(",") || "-"}`);
  }
  const noop = report.filter((x) => x.action === "no-op").map((x) => x.id);
  if (noop.length) console.log(`  no-op: ${noop.join(", ")}`);
} else {
  const commit = await tx.commit({visibility: "sync"});
  console.log(`\nApplied in transaction ${commit.transactionId}`);
  console.log("Patched docs:");
  for (const r of report.filter((x) => x.action === "patched")) {
    console.log(`  ${r.id}: set=${r.set.join(",") || "-"} unset=${r.unset.join(",") || "-"}`);
  }
}
