// Idempotent, resumable import of verified publications into Sanity Production.
//
// Reads:  MIGRATION_INPUT env var — absolute path to the private publications-verified.json.
//         The input lives OUTSIDE this repo (under the mentor's private 课题组网站记录 tree),
//         so its path must be supplied via env, never hardcoded here.
// Writes: Sanity production dataset (documents + file assets) — NO publish of new drafts.
//         A migration-result.json next to the input recording per-pub action + asset ids.
//
// Auth: uses sanity/cli getCliClient (cached Studio/CLI Google login — no token in env).
//
// Idempotency:
//   - targetId is stable (existingId when matching one of the 12, else derived from DOI/title).
//   - createIfNotExists is a no-op if the doc already exists.
//   - PDF asset upload is SKIPPED if the doc already has publicFile.file.asset attached.
//   - Existing 12 keep their published status (status not touched); new docs are created as draft.
//   - Re-running the whole script is safe.
//
// Per-step 7: only modifies target fields; uncertain/keepAsDraft entries are left as draft
// with a reviewNote explaining why, so the mentor can review them in Studio before publishing.
//
// Run:  MIGRATION_INPUT=/path/to/publications-verified.json \
//         npm --prefix studio run migrate:publications

import {readFile, writeFile} from "node:fs/promises";
import {createReadStream} from "node:fs";
import {getCliClient} from "sanity/cli";

const INPUT = process.env.MIGRATION_INPUT;
if (!INPUT) {
  console.error("MIGRATION_INPUT env var is required (absolute path to publications-verified.json).");
  console.error("The input lives outside this repo; its path must not be hardcoded.");
  process.exit(1);
}
const RESULT_PATH = INPUT.replace(/\.json$/u, "-migration-result.json");

const rows = JSON.parse(await readFile(INPUT, "utf8"));
if (!Array.isArray(rows)) throw new Error("Expected a JSON array of publications");

const client = getCliClient({apiVersion: "2025-02-19"});

// Pre-fetch existing publication docs so we can skip asset upload for ones already attached,
// preserve featured + status on the existing 12, and avoid duplicate asset uploads on re-run.
const existingById = new Map();
for await (const doc of rows) {
  const id = resolveTargetId(doc);
  if (!id) continue;
  const found = await client.fetch(`*[_id == $id][0]{_id, status, featured, "hasFile": defined(publicFile.file.asset)}`, {id});
  existingById.set(id, found);
}

const results = [];
const tx = client.transaction();

for (const [index, doc] of rows.entries()) {
  const targetId = resolveTargetId(doc);
  if (!targetId) {
    results.push({input: doc, action: "skipped", reason: "no targetId"});
    continue;
  }
  const existing = existingById.get(targetId);
  console.log(`[${index + 1}/${rows.length}] ${targetId} ${existing ? "update" : "create"}${doc.keepAsDraft ? " draft" : ""}${doc.pdfFile ? " +pdf" : ""}`);


  // Upload PDF asset if we have a file path and the doc does not already have one attached.
  let assetRef = null;
  if (doc.pdfFile) {
    if (existing?.hasFile) {
      results.push({targetId, action: "asset-skipped", reason: "file already attached"});
      console.log(`    asset: skipped (already attached)`);
    } else {
      try {
        const upload = await client.assets.upload("file", createReadStream(doc.pdfFile), {
          filename: cleanFilename(doc.pdfFile),
          contentType: "application/pdf",
        });
        assetRef = upload._id || upload.id || upload._ref;
        results.push({targetId, action: "asset-uploaded", assetId: assetRef});
        console.log(`    asset: uploaded ${assetRef}`);
      } catch (error) {
        results.push({targetId, action: "asset-failed", error: String(error?.message || error)});
        console.log(`    asset: FAILED ${String(error?.message || error).slice(0, 120)}`);
      }
    }
  }

  const fields = buildFields(doc, existing, assetRef);
  tx.createIfNotExists({_id: targetId, _type: "publication"});
  tx.patch(targetId, (patch) => patch.set(fields));
  results.push({targetId, action: existing ? "updated" : "created", status: fields.status ?? existing?.status ?? "draft"});
}

const commit = await tx.commit({visibility: "sync"});
await writeFile(RESULT_PATH, JSON.stringify({transactionId: commit.transactionId, results}, null, 2), "utf8");

const created = results.filter((r) => r.action === "created").length;
const updated = results.filter((r) => r.action === "updated").length;
const uploaded = results.filter((r) => r.action === "asset-uploaded").length;
const skipped = results.filter((r) => r.action === "asset-skipped").length;
const failed = results.filter((r) => r.action === "asset-failed").length;
console.log(`Migration committed in transaction ${commit.transactionId}`);
console.log(`  created ${created} docs, updated ${updated} docs`);
console.log(`  uploaded ${uploaded} PDF assets, skipped ${skipped} already-attached, failed ${failed}`);
console.log(`  result: ${RESULT_PATH}`);

function resolveTargetId(doc) {
  if (doc.existingId) return doc.existingId; // publication-001..012
  // Sanity document IDs must be ASCII ([a-z0-9._-]). DOIs are ASCII; for non-DOI
  // entries (often Chinese titles, which would inject non-ASCII into the ID) fall
  // back to the PDF sha256 prefix — always ASCII and unique per file.
  const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  if (doc.doi) return `publication-doi-${slug(doc.doi) || "unkeyed"}`;
  const shaPrefix = doc.sha256 ? String(doc.sha256).slice(0, 12) : "";
  if (shaPrefix) return `publication-t-${doc.year ?? "ny"}-${shaPrefix}`;
  const titleSlug = slug(doc.title || doc.titleZh);
  return `publication-t-${doc.year ?? "ny"}-${titleSlug || "unkeyed"}`;
}

function buildFields(doc, existing, assetRef) {
  const fields = {};
  // Localized title / abstract.
  if (doc.title || doc.titleZh) fields.title = {en: doc.title || undefined, zh: doc.titleZh || undefined};
  if (doc.authors) fields.authors = doc.authors;
  if (doc.year) fields.year = Number(doc.year);
  if (doc.venue) fields.venue = cleanVenue(doc);
  if (doc.volume) fields.volume = String(doc.volume);
  if (doc.issue) fields.issue = String(doc.issue);
  if (doc.pages) fields.pages = String(doc.pages);
  if (doc.articleNumber) fields.articleNumber = String(doc.articleNumber);
  if (doc.kind) fields.kind = doc.kind;
  if (doc.language) fields.language = doc.language;
  if (doc.doi) fields.doi = String(doc.doi);
  if (doc.sourceUrl) fields.sourceUrl = doc.sourceUrl;
  if (doc.abstract || doc.abstractZh) fields.abstract = {en: doc.abstract || undefined, zh: doc.abstractZh || undefined};
  if (Array.isArray(doc.keywords) && doc.keywords.length) fields.keywords = doc.keywords;
  // featured: preserve existing for the 12; for new docs use the JSON value (default false).
  if (!existing) fields.featured = Boolean(doc.featured);
  // PDF + copyright clearance.
  if (assetRef) fields.publicFile = {file: {asset: {_type: "reference", _ref: assetRef}}, copyrightCleared: true};
  // Status: existing 12 keep their status (do not touch). New docs start as draft.
  //   Uncertain entries are explicitly draft + reviewNote.
  if (!existing) {
    fields.status = "draft";
    if (doc.keepAsDraft && doc.draftReason) fields.reviewNote = doc.draftReason;
  } else if (doc.keepAsDraft && doc.draftReason) {
    // Existing doc flagged as uncertain — set reviewNote but leave its status alone.
    fields.reviewNote = doc.draftReason;
  }
  return fields;
}

// venue is stored as the journal/conference/publisher NAME only when volume/issue/pages
// are present, to avoid duplicating the citation in both venue and structured fields.
function cleanVenue(doc) {
  if (!doc.venue) return doc.venue;
  if (!doc.volume && !doc.issue && !doc.pages && !doc.articleNumber) return doc.venue;
  // Strip trailing ", vol(issue), pages" style tails that the PDF prints alongside the name.
  return String(doc.venue)
    .replace(/,?\s*\d{1,4}\s*[ (（]\d{0,4}[)）]\s*,?\s*\d{1,4}\s*[-–—]\s*\d{1,4}\s*$/u, "")
    .replace(/,?\s*\d{1,4}\s*\([\d–-]+\)\s*,?\s*\d{1,4}\s*[-–—]\s*\d{1,4}\s*$/u, "")
    .replace(/[,\s]+$/u, "")
    .trim() || doc.venue;
}

function cleanFilename(path) {
  // Original filenames are NOT stored (storeOriginalFilename: false), but the upload still
  // wants a non-personal, sane name for Studio display. Use a sanitized basename.
  const base = String(path).split(/[/\\]/u).pop() || "publication.pdf";
  return base.replace(/[^\w.\-]+/gu, "-").replace(/-+/gu, "-").slice(-80);
}
