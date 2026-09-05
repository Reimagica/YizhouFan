// Verify and update published person portraits from a directory whose filenames are member names.
// Required: PORTRAIT_DIR=...; optional PERSONS_MODE=query|backup|apply (default query).
// Backup mode writes a gzip NDJSON snapshot; apply mode uploads images and patches only portrait.asset.

import {createReadStream, createWriteStream} from "node:fs";
import {readdir, readFile, stat} from "node:fs/promises";
import {basename, extname, resolve} from "node:path";
import {createGzip} from "node:zlib";
import {getCliClient} from "sanity/cli";

const directory = process.env.PORTRAIT_DIR;
const mode = process.env.PERSONS_MODE ?? "query";
const backupPath = process.env.PERSONS_BACKUP;
if (!directory) throw new Error("PORTRAIT_DIR is required");
if (!["query", "backup", "apply", "verify"].includes(mode)) throw new Error(`Unsupported PERSONS_MODE: ${mode}`);
if (mode === "backup" && !backupPath) throw new Error("PERSONS_BACKUP is required in backup mode");

const client = getCliClient({apiVersion: "2025-02-19"});
const docs = await client.fetch(`*[_type == "person"] | order(_id asc){
  _id, _type, _rev, _createdAt, _updatedAt, status, name, position,
  enrollmentYear, bio, portrait, order, profileUrl, publicEmail, category,
  "portraitAsset": portrait.asset->{_id, url, mimeType, size, "width": metadata.dimensions.width, "height": metadata.dimensions.height}
}`);
const files = (await readdir(directory, {withFileTypes: true}))
  .filter((entry) => entry.isFile() && /\.(?:jpe?g|png)$/iu.test(entry.name))
  .map((entry) => ({name: entry.name, path: resolve(directory, entry.name), stem: basename(entry.name, extname(entry.name))}));
if (files.length === 0) throw new Error("No JPG/JPEG/PNG portraits found");

function localizedNames(doc) {
  return Object.values(doc.name ?? {}).filter((value) => typeof value === "string" && value.trim());
}

const matches = files.map((file) => {
  const matched = docs.filter((doc) => localizedNames(doc).some((name) => name.trim() === file.stem.trim()));
  if (matched.length !== 1) throw new Error(`${file.name} matches ${matched.length} person documents`);
  return {file, doc: matched[0]};
});
const matchedIds = new Set(matches.map(({doc}) => doc._id));
if (matchedIds.size !== docs.length) {
  const missing = docs.filter((doc) => !matchedIds.has(doc._id)).map((doc) => `${doc._id}:${localizedNames(doc).join("/")}`);
  throw new Error(`Missing portraits for Sanity people: ${missing.join(", ")}`);
}

if (mode === "query") {
  console.log(JSON.stringify(matches.map(({file, doc}) => ({file: file.name, _id: doc._id, name: doc.name, status: doc.status, currentAsset: doc.portraitAsset ?? null})), null, 2));
} else if (mode === "verify") {
  const checks = await Promise.all(matches.map(async ({file, doc}) => {
    const url = doc.portraitAsset?.url;
    if (!url) return {file: file.name, _id: doc._id, status: "missing-url"};
    try {
      const response = await fetch(url, {method: "HEAD", cache: "no-store"});
      return {file: file.name, _id: doc._id, status: response.status, contentType: response.headers.get("content-type"), contentLength: response.headers.get("content-length")};
    } catch (error) {
      return {file: file.name, _id: doc._id, status: "error", error: error instanceof Error ? error.message : "unknown"};
    }
  }));
  console.log(JSON.stringify(checks, null, 2));
} else if (mode === "backup") {
  const gzip = createGzip();
  const stream = createWriteStream(backupPath);
  gzip.pipe(stream);
  for (const doc of docs) gzip.write(JSON.stringify(doc) + "\n");
  gzip.end();
  await new Promise((resolvePromise, reject) => { stream.on("finish", resolvePromise); stream.on("error", reject); });
  console.log(JSON.stringify({path: backupPath, docs: docs.length, bytes: (await readFile(backupPath)).length}, null, 2));
} else {
  for (const {file} of matches) {
    const fileInfo = await stat(file.path);
    if (fileInfo.size === 0) throw new Error(`${file.name} is empty`);
  }
  const uploaded = [];
  for (const {file, doc} of matches) {
    console.log(`Uploading ${file.name} for ${doc._id}...`);
    const asset = await client.assets.upload("image", createReadStream(file.path), {filename: file.name});
    uploaded.push({file, doc, asset});
  }
  const transaction = client.transaction();
  for (const {doc, asset} of uploaded) {
    const portrait = {
      ...(doc.portrait ?? {_type: "image"}),
      _type: "image",
      asset: {_type: "reference", _ref: asset._id},
    };
    transaction.patch(doc._id, {set: {portrait}});
  }
  const result = await transaction.commit();
  console.log(JSON.stringify({updated: uploaded.map(({doc, file, asset}) => ({_id: doc._id, file: file.name, asset: asset._id})), transactionId: result.transactionId}, null, 2));
}
