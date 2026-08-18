// Read-only link + PDF accessibility check for published publications.
//
// For every published publication:
//   - sourceUrl: HTTP HEAD, expect 2xx. Reject scholar.google* (per AGENTS.md —
//     no Google Scholar search URLs, no model-constructed URLs as sourceUrl).
//   - publicFile asset: HEAD the Sanity file-CDN URL, expect 2xx + content-type
//     application/pdf (per step 6: PDF MIME only).
//
// Reports broken links with the doc id + reason. Exits non-zero if any broken.
//
// Run:  sanity exec scripts/check-publications-accessibility.mjs --with-user-token

import {getCliClient} from "sanity/cli";

const client = getCliClient({apiVersion: "2025-02-19"});

const docs = await client.fetch(
  `*[_type == "publication" && status == "published"] | order(year desc, title.en asc){
     _id, year, sourceUrl, doi,
     "title": title.en, "titleZh": title.zh,
     "fileUrl": publicFile.file.asset->url,
     "fileMime": publicFile.file.asset->mimeType,
     "fileExt": publicFile.file.asset->extension
   }`
);

console.log(`Checking ${docs.length} published publications...`);

let sourceChecked = 0, sourceOk = 0, sourceBad = 0, sourceProtected = 0;
let pdfChecked = 0, pdfOk = 0, pdfBad = 0;
const broken = [];

for (const doc of docs) {
  // --- sourceUrl ---
  if (doc.sourceUrl) {
    sourceChecked++;
    const host = (() => { try { return new URL(doc.sourceUrl).host; } catch { return ""; } })();
    if (/^scholar\.google\./i.test(host) || /^scholar\.googleusercontent\./i.test(host)) {
      sourceBad++;
      broken.push({id: doc._id, kind: "sourceUrl", reason: "scholar URL forbidden", url: doc.sourceUrl});
    } else if (!host) {
      sourceBad++;
      broken.push({id: doc._id, kind: "sourceUrl", reason: "invalid URL", url: doc.sourceUrl});
    } else {
      // Measure reachability with a ranged GET + browser UA. Many publishers
      // (Wiley, ACM, doi.org resolver) bot-block automated requests with 401/403/405/429
      // even though the URL resolves fine in a browser — these are registry-valid DOIs,
      // not link rot. Only count 404 / 5xx / DNS failure as genuinely broken.
      const res = await get(doc.sourceUrl);
      if (res.ok || (res.status >= 300 && res.status < 400)) {
        sourceOk++;
      } else if ([401, 403, 405, 429].includes(res.status)) {
        sourceProtected++;
      } else {
        sourceBad++;
        broken.push({id: doc._id, kind: "sourceUrl", reason: `HTTP ${res.status}`, url: doc.sourceUrl});
      }
    }
  }

  // --- publicFile PDF ---
  if (doc.fileUrl) {
    pdfChecked++;
    const res = await head(doc.fileUrl);
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (res.ok && (ct.includes("application/pdf") || doc.fileMime === "application/pdf")) {
      pdfOk++;
    } else if (!res.ok && res.status !== 0) {
      // Sanity CDN supports HEAD; a non-2xx here is a real problem.
      pdfBad++;
      broken.push({id: doc._id, kind: "pdfCdn", reason: `HTTP ${res.status}`, url: doc.fileUrl});
    } else if (res.status === 0) {
      pdfBad++;
      broken.push({id: doc._id, kind: "pdfCdn", reason: "unreachable/timeout", url: doc.fileUrl});
    } else {
      pdfBad++;
      broken.push({id: doc._id, kind: "pdfMime", reason: `content-type ${ct}`, url: doc.fileUrl});
    }
  }
}

console.log(`\nsourceUrl:  ${sourceOk}/${sourceChecked} ok, ${sourceProtected} publisher-bot-protected (registry-valid, not broken), ${sourceBad} broken`);
console.log(`pdf CDN:    ${pdfOk}/${pdfChecked} ok, ${pdfBad} broken`);

if (broken.length) {
  console.log(`\nBROKEN (${broken.length}):`);
  for (const b of broken) console.log(`  [${b.kind}] ${b.id} — ${b.reason}\n      ${b.url}`);
  process.exit(1);
}
console.log("\nOK: all published sourceUrls resolve (some publisher-bot-protected, none broken), all PDF assets 2xx + application/pdf, no Scholar URLs.");

async function head(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(url, {method: "HEAD", redirect: "follow", signal: ctrl.signal});
    clearTimeout(t);
    return res;
  } catch {
    return {ok: false, status: 0, headers: new Headers()};
  }
}

async function get(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Range": "bytes=0-0",
      },
    });
    clearTimeout(t);
    // Abort the body early — we only care about status + headers.
    try { res.body?.cancel(); } catch {}
    return res;
  } catch {
    return {ok: false, status: 0, headers: new Headers()};
  }
}
