// Idempotent migration of the 11-talk whitelist into Sanity Production.
//
// Matches each whitelist entry to an existing talk by normalized title + normalized
// year-month. Matched talks are UPDATED (title.en, host.en, date, displayOrder,
// status=published) without touching body/attachments/type. Unmatched whitelist
// entries are CREATED with stable IDs. Existing talks not in the whitelist are
// ARCHIVED (status=draft) — never deleted, fully recoverable.
//
// Inputs (env):
//   TALK_WHITELIST_INPUT  — absolute path to talk-whitelist-input.json (11 entries).
//                           Lives outside the repo; path via env, never hardcoded.
//   PATCH_APPLY=1         — commit; otherwise dry-run.
//
// Safety:
//   - Validates exactly 11 entries, unique ids, unique displayOrder, unique (date+title).
//   - Only patches fields that differ (idempotent re-run = 0 planned).
//   - createIfNotExists for new talks; never overwrites an existing _id.
//   - Single transaction. Re-run is a no-op.
//
// Run (dry-run):  TALK_WHITELIST_INPUT=... npm --prefix studio run migrate:talks
// Run (apply):    TALK_WHITELIST_INPUT=... PATCH_APPLY=1 npm --prefix studio run migrate:talks

import {readFile} from "node:fs/promises";
import {getCliClient} from "sanity/cli";

const INPUT = process.env.TALK_WHITELIST_INPUT;
if (!INPUT) {
  console.error("TALK_WHITELIST_INPUT env var is required (absolute path to talk-whitelist-input.json).");
  console.error("The input lives outside this repo; its path must not be hardcoded.");
  process.exit(1);
}
const APPLY = process.env.PATCH_APPLY === "1";

const cfg = JSON.parse(await readFile(INPUT, "utf8"));
const whitelist = cfg.talks;
if (!Array.isArray(whitelist) || whitelist.length !== 11) {
  console.error(`whitelist must have 11 talks (got ${Array.isArray(whitelist) ? whitelist.length : "non-array"})`);
  process.exit(1);
}
for (const t of whitelist) {
  if (!t.id || !t.date || !t.title || !t.host || typeof t.displayOrder !== "number") {
    console.error(`whitelist entry missing required fields: ${JSON.stringify(t)}`);
    process.exit(1);
  }
}
const wlIds = new Set(whitelist.map((t) => t.id));
if (wlIds.size !== 11) { console.error("whitelist ids not unique"); process.exit(1); }
const wlOrders = new Set(whitelist.map((t) => t.displayOrder));
if (wlOrders.size !== 11) { console.error("whitelist displayOrder not unique"); process.exit(1); }

const norm = (s) => (s == null ? "" : String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ""));
const normDate = (d) => (d == null ? "" : String(d).slice(0, 7)); // YYYY-MM from YYYY-MM or YYYY-MM-DD
const wlKey = (t) => `${norm(t.title)}|${normDate(t.date)}`;
const wlKeys = new Set(whitelist.map(wlKey));
// Detect duplicate (date+title) combos within the whitelist itself.
if (wlKeys.size !== 11) { console.error("whitelist has duplicate normalized (date+title) entries"); process.exit(1); }

const client = getCliClient({apiVersion: "2025-02-19"});
const existing = await client.fetch(
  `*[_type == "talk"]{_id, status, date, "titleEn": title.en, "hostEn": host.en, displayOrder, "bodyEn": body.en, "hasAttachments": count(attachments[defined(file.asset)])}`
);

// Build match index from existing talks.
const matchIndex = new Map(); // wlKey → existing doc
for (const d of existing) {
  const key = `${norm(d.titleEn)}|${normDate(d.date)}`;
  if (!matchIndex.has(key)) matchIndex.set(key, d);
}

const tx = client.transaction();
const report = [];
let createPlanned = 0, updatePlanned = 0, archivePlanned = 0;
const matchedExistingIds = new Set();

for (const wl of whitelist) {
  const key = wlKey(wl);
  const match = matchIndex.get(key);
  if (match) {
    matchedExistingIds.add(match._id);
    // UPDATE: diff actual values, patch only changed fields.
    const setFields = {};
    if (norm(match.titleEn) !== norm(wl.title)) setFields["title.en"] = wl.title;
    // host.en comparison uses normalized too (whitespace/punct tolerant), but set actual.
    if (norm(match.hostEn) !== norm(wl.host)) setFields["host.en"] = wl.host;
    if (match.date !== wl.date) setFields.date = wl.date;
    if (match.displayOrder !== wl.displayOrder) setFields.displayOrder = wl.displayOrder;
    if (match.status !== "published") setFields.status = "published";
    const idMismatch = match._id !== wl.id;
    if (Object.keys(setFields).length) {
      updatePlanned++;
      tx.patch(match._id, (p) => p.set(setFields));
      report.push({action: APPLY ? "updated" : "would-update", id: match._id, wlId: wl.id, idMismatch, set: Object.keys(setFields)});
    } else {
      report.push({action: "no-op", id: match._id, wlId: wl.id, idMismatch});
    }
  } else {
    // CREATE
    createPlanned++;
    const doc = {
      _id: wl.id,
      _type: "talk",
      title: {en: wl.title},
      date: wl.date,
      displayOrder: wl.displayOrder,
      host: {en: wl.host},
      status: "published",
    };
    tx.createIfNotExists(doc);
    report.push({action: APPLY ? "created" : "would-create", id: wl.id, set: ["title.en", "host.en", "date", "displayOrder", "status"]});
  }
}

// ARCHIVE: existing talks not matched to any whitelist entry → status=draft.
for (const d of existing) {
  if (matchedExistingIds.has(d._id)) continue;
  if (d.status === "draft") { report.push({action: "no-op-archived", id: d._id}); continue; }
  archivePlanned++;
  tx.patch(d._id, (p) => p.set({status: "draft"}));
  report.push({action: APPLY ? "archived" : "would-archive", id: d._id, set: ["status"]});
}

console.log(`\nPlanned: ${createPlanned} create, ${updatePlanned} update, ${archivePlanned} archive.`);
console.log(`Existing talks: ${existing.length}. Matched to whitelist: ${matchedExistingIds.size}.`);
if (!APPLY) {
  console.log("DRY RUN — set PATCH_APPLY=1 to commit. No changes written.");
  console.log("\nPer-doc changes:");
  for (const r of report) {
    if (r.action === "no-op") continue;
    const extra = r.idMismatch ? " [id≠whitelist]" : "";
    console.log(`  ${r.action}: ${r.id}${extra} set=${r.set.join(",") || "-"}`);
  }
  const noop = report.filter((r) => r.action === "no-op").map((r) => r.id);
  if (noop.length) console.log(`  no-op (already matched, no diff): ${noop.join(", ")}`);
} else {
  const commit = await tx.commit({visibility: "sync"});
  console.log(`\nApplied in transaction ${commit.transactionId}`);
  for (const r of report) {
    if (r.action === "no-op") continue;
    const extra = r.idMismatch ? " [id≠whitelist]" : "";
    console.log(`  ${r.action}: ${r.id}${extra} set=${r.set.join(",") || "-"}`);
  }
}
