// Full backup of all talk docs to NDJSON.gz. Run from studio/ cwd.
//   BACKUP_OUTPUT=/abs/path.ndjson.gz npm --prefix studio run backup:talks
// Writes one JSON doc per line (so line count == doc count), gzip-compressed.
// Prints the output path, byte size, line count, and SHA-256 to stdout.

import {createWriteStream} from "node:fs";
import {createGzip} from "node:zlib";
import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {getCliClient} from "sanity/cli";

const OUT = process.env.BACKUP_OUTPUT;
if (!OUT) { console.error("BACKUP_OUTPUT env var required (absolute .ndjson.gz path)"); process.exit(1); }

const client = getCliClient({apiVersion: "2025-02-19"});
const docs = await client.fetch(`*[_type == "talk"] | order(_id asc){
  _id, _type, _rev, _createdAt, _updatedAt,
  status, title, date, type, host, summary, keywords,
  displayOrder, body, attachments, publicFile,
  "assetCount": count(attachments[defined(file.asset)])
}`);

const out = createWriteStream(OUT);
const gz = createGzip();
gz.pipe(out);
const hash = createHash("sha256");
let lines = 0;
for (const doc of docs) {
  const line = JSON.stringify(doc) + "\n";
  gz.write(line);
  hash.update(line);
  lines++;
}
await new Promise((resolve, reject) => { gz.end(() => resolve()); gz.on("error", reject); });
await new Promise((resolve, reject) => { out.on("finish", resolve); out.on("error", reject); });

const {size} = await readFile(OUT).then((b) => ({size: b.length})).catch(() => ({size: -1}));
const sha = hash.digest("hex");
console.log(JSON.stringify({path: OUT, docs: lines, bytes: size, sha256: sha, generatedAt: new Date().toISOString()}, null, 2));
