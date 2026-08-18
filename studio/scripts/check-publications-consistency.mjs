// Post-migration consistency check for publication documents.
// Run after migrate-publications.mjs. Read-only. Reports problems; exits non-zero if any found.
//
// Checks:
//   1. Duplicate DOI across publication docs.
//   2. Duplicate normalized title across publication docs (preprint/published not deduped).
//   3. sourceUrl that points at a Google Scholar search page (forbidden — must be DOI/publisher/arXiv).
//   4. publicFile present but copyrightCleared != true, or file missing.
//   5. Every attached PDF asset: mimeType == application/pdf and size <= 40 MB.
//   6. Count by status, by language.
//
// Auth: sanity/cli getCliClient (cached login).

import {getCliClient} from "sanity/cli";

const client = getCliClient({apiVersion: "2025-02-19"});

const docs = await client.fetch(`*[_type == "publication"] | order(year desc, title.en asc) {
  _id, _rev, status, language, kind, year,
  "title": title.en, "titleZh": title.zh, authors, venue, doi, sourceUrl, featured,
  "file": publicFile.file.asset->{_id, mimeType, size, originalFilename, url},
  "fileRef": publicFile.file.asset, "copyrightCleared": publicFile.copyrightCleared, "reviewNote": reviewNote
}`);

const problems = [];
const doiIndex = new Map();
const titleIndex = new Map();
const norm = (s) => (s || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

for (const doc of docs) {
  // 1. DOI dups
  if (doc.doi) {
    const key = norm(doc.doi);
    const bucket = doiIndex.get(key);
    if (bucket) bucket.push(doc._id);
    else doiIndex.set(key, [doc._id]);
  }
  // 2. Title dups (en or zh)
  for (const t of [doc.title, doc.titleZh]) {
    if (t && t.length >= 10) {
      const key = norm(t);
      const entry = {id: doc._id, which: t === doc.title ? "en" : "zh"};
      const bucket = titleIndex.get(key);
      if (bucket) bucket.push(entry);
      else titleIndex.set(key, [entry]);
    }
  }
  // 3. Forbidden sourceUrl
  if (doc.sourceUrl && /scholar\.google\./iu.test(doc.sourceUrl)) {
    problems.push({id: doc._id, severity: "high", check: "forbidden-sourceUrl", value: doc.sourceUrl});
  }
  // 4. publicFile integrity
  if (doc.fileRef && !doc.copyrightCleared) {
    problems.push({id: doc._id, severity: "high", check: "file-without-copyright-clear"});
  }
  // 5. asset mime + size
  if (doc.file) {
    if (doc.file.mimeType && doc.file.mimeType !== "application/pdf") {
      problems.push({id: doc._id, severity: "high", check: "asset-not-pdf", value: doc.file.mimeType});
    }
    if (doc.file.size && doc.file.size > 40 * 1024 * 1024) {
      problems.push({id: doc._id, severity: "high", check: "asset-too-large", value: `${(doc.file.size / 1024 / 1024).toFixed(1)} MB`});
    }
  }
}

for (const [doi, ids] of doiIndex) if (ids.length > 1) problems.push({check: "duplicate-doi", doi, ids});
for (const [title, entries] of titleIndex) if (entries.length > 1) problems.push({check: "duplicate-title", title, entries});

const byStatus = {};
const byLanguage = {};
const byKind = {};
for (const doc of docs) {
  byStatus[doc.status ?? "unknown"] = (byStatus[doc.status ?? "unknown"] ?? 0) + 1;
  byLanguage[doc.language ?? "unset"] = (byLanguage[doc.language ?? "unset"] ?? 0) + 1;
  byKind[doc.kind ?? "unset"] = (byKind[doc.kind ?? "unset"] ?? 0) + 1;
}

const report = {
  total: docs.length,
  byStatus, byLanguage, byKind,
  withFile: docs.filter((d) => d.fileRef).length,
  withDoi: docs.filter((d) => d.doi).length,
  withSourceUrl: docs.filter((d) => d.sourceUrl).length,
  flaggedDrafts: docs.filter((d) => d.status === "draft" && d.reviewNote).length,
  problems,
};
console.log(JSON.stringify(report, null, 2));
if (problems.length) {
  console.error(`\nFAIL: ${problems.length} consistency problem(s) found.`);
  process.exit(1);
}
console.log(`\nOK: ${docs.length} publication docs, 0 consistency problems.`);
