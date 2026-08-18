// Idempotent audit-fix patcher for publication docs in Sanity Production.
//
// Applies the 2026-08-18 independent-audit fixes to existing publication docs:
//   - abstract.en: replace with the VERBATIM full abstract re-extracted from each PDF
//     (only where the re-extracted text differs from the current Sanity value; null
//     re-extractions and Chinese-language pubs are left untouched).
//   - venue: replace with the cleaned name-only venue (no trailing vol/issue/pages).
//   - pages: UNSET when the entry is article-number-only (articleNumber present,
//     pages empty in source) — clears the duplicated article number from pages.
//   - volume / issue / articleNumber: set to the cleaned source values where changed.
//
// Idempotency: fetches current Sanity state first and builds a patch only for fields
// that actually differ. Re-running is a no-op once Sanity matches the source. Existing
// published status, featured flag, PDF asset, title, authors, year, doi, sourceUrl,
// keywords, kind, language and abstract.zh are NOT touched.
//
// Inputs (env):
//   MIGRATION_INPUT       — absolute path to the cleaned publications-verified.json
//   ABSTRACTS_COLLECTED   — absolute path to en-abstracts-collected.json (verbatim PDF abstracts)
//   ABSTRACTS_FIXUP       — absolute path to en-abstracts-fixup.json (optional, the 6 re-extractions)
//   PATCH_APPLY=1         — actually commit; otherwise dry-run (prints planned changes only).
//
// Run (dry-run):  MIGRATION_INPUT=... ABSTRACTS_COLLECTED=... [ABSTRACTS_FIXUP=...] \
//                   npm --prefix studio run patch:publications
// Run (apply):    ... PATCH_APPLY=1 npm --prefix studio run patch:publications

import {readFile} from "node:fs/promises";
import {getCliClient} from "sanity/cli";

const INPUT = mustEnv("MIGRATION_INPUT");
const ABSTRACTS_COLLECTED = mustEnv("ABSTRACTS_COLLECTED");
const ABSTRACTS_FIXUP = process.env.ABSTRACTS_FIXUP; // optional
const APPLY = process.env.PATCH_APPLY === "1";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) { console.error(`Missing env var ${name}`); process.exit(1); }
  return v;
}

const norm = (s) => (s || "").replace(/\s+/gu, " ").trim();

function slug(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
function resolveTargetId(doc) {
  if (doc.existingId) return doc.existingId;
  if (doc.doi) return `publication-doi-${slug(doc.doi) || "unkeyed"}`;
  const shaPrefix = doc.sha256 ? String(doc.sha256).slice(0, 12) : "";
  if (shaPrefix) return `publication-t-${doc.year ?? "ny"}-${shaPrefix}`;
  const titleSlug = slug(doc.title || doc.titleZh);
  return `publication-t-${doc.year ?? "ny"}-${titleSlug || "unkeyed"}`;
}

const rows = JSON.parse(await readFile(INPUT, "utf8"));
const abstracts = new Map();
for (const a of JSON.parse(await readFile(ABSTRACTS_COLLECTED, "utf8"))) {
  if (a.abstract !== null && a.abstract !== undefined) abstracts.set(a.id, a.abstract);
}
if (ABSTRACTS_FIXUP) {
  for (const a of JSON.parse(await readFile(ABSTRACTS_FIXUP, "utf8"))) {
    if (a.abstract !== null && a.abstract !== undefined) abstracts.set(a.id, a.abstract);
  }
}

const client = getCliClient({apiVersion: "2025-02-19"});
const sanityDocs = await client.fetch(
  `*[_type == "publication"]{_id, status, venue, volume, issue, pages, articleNumber, "abstractEn": abstract.en}`
);
const byId = new Map(sanityDocs.map((d) => [d._id, d]));

const tx = client.transaction();
let planned = 0;
let abstractPatches = 0, venuePatches = 0, pagesUnsets = 0, citationPatches = 0;
const report = [];

for (const doc of rows) {
  const id = resolveTargetId(doc);
  const cur = byId.get(id);
  if (!cur) { report.push({id, action: "skipped", reason: "not in Sanity"}); continue; }

  const setFields = {};
  const unsetFields = [];

  // 1. abstract.en — verbatim PDF abstract where re-extracted and differing
  const pdfAbs = abstracts.get(id);
  if (pdfAbs && norm(pdfAbs) !== norm(cur.abstractEn || "")) {
    setFields.abstract = {en: pdfAbs};
    abstractPatches++;
  }

  // 2. venue — cleaned name only
  if (doc.venue && norm(doc.venue) !== norm(cur.venue || "")) {
    setFields.venue = doc.venue;
    venuePatches++;
  }

  // 3. volume / issue / articleNumber — set where source differs from Sanity
  for (const [f, v] of [["volume", doc.volume], ["issue", doc.issue], ["articleNumber", doc.articleNumber]]) {
    const src = v ? String(v) : "";
    const curV = cur[f] ? String(cur[f]) : "";
    if (src !== curV) {
      if (src) setFields[f] = src;
      else unsetFields.push(f);
    }
  }

  // 4. pages — UNSET when source is article-number-only (articleNumber present, pages empty)
  //    and Sanity still has a pages value (the duplicated article number).
  if (doc.articleNumber && !doc.pages && cur.pages) {
    unsetFields.push("pages");
    pagesUnsets++;
  } else if (doc.pages && norm(String(doc.pages)) !== norm(String(cur.pages || ""))) {
    setFields.pages = String(doc.pages);
    citationPatches++;
  }

  // Apply: patch.set on the localized abstract via the field path, plus flat fields.
  if (Object.keys(setFields).length || unsetFields.length) {
    // abstract is localized {en,zh} — set only en via patch path, preserve zh.
    const flatSet = {};
    for (const [k, v] of Object.entries(setFields)) {
      if (k === "abstract") continue; // handled separately below
      flatSet[k] = v;
    }
    tx.patch(id, (p) => {
      if (setFields.abstract) p.set({[`abstract.en`]: setFields.abstract.en});
      if (Object.keys(flatSet).length) p.set(flatSet);
      if (unsetFields.length) p.unset(unsetFields);
      return p;
    });
    planned++;
    report.push({id, action: APPLY ? "patched" : "would-patch", set: Object.keys(setFields), unset: unsetFields});
  }
}

console.log(`\nPlanned patches: ${planned} docs`);
console.log(`  abstract.en replaced: ${abstractPatches}`);
console.log(`  venue cleaned: ${venuePatches}`);
console.log(`  pages unset (article-number-only): ${pagesUnsets}`);
console.log(`  volume/issue/articleNumber set: ${citationPatches}`);

if (!APPLY) {
  console.log("\nDRY RUN — set PATCH_APPLY=1 to commit. No changes written.");
  console.log("\nPlanned changes (id → set/unset):");
  for (const r of report.filter((x) => x.action === "would-patch")) {
    console.log(`  ${r.id}: set=${r.set.join(",")||"-"} unset=${r.unset.join(",")||"-"}`);
  }
} else {
  const commit = await tx.commit({visibility: "sync"});
  console.log(`\nApplied in transaction ${commit.transactionId}`);
  console.log("Patched docs:");
  for (const r of report.filter((x) => x.action === "patched")) {
    console.log(`  ${r.id}: set=${r.set.join(",")||"-"} unset=${r.unset.join(",")||"-"}`);
  }
}
