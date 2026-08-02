import {writeFile} from "node:fs/promises";
import {fallbackProfile} from "../lib/cms/content.ts";
import {people, publications, talks} from "../lib/content.ts";

const outputPath = process.argv[2] ?? "/private/tmp/yizhoufan-initial-content.ndjson";
const en = fallbackProfile("en");
const zh = fallbackProfile("zh");

const localized = (enValue, zhValue) => ({en: enValue, zh: zhValue});
const keyed = (prefix, index, value) => ({_key: `${prefix}-${index + 1}`, ...value});

const profile = {
  _id: "profile-yizhou-fan",
  _type: "profile",
  name: localized(en.name, zh.name),
  role: localized(en.role, zh.role),
  affiliation: localized(en.affiliation, zh.affiliation),
  email: en.email,
  bio: localized(en.bio.join("\n\n"), zh.bio.join("\n\n")),
  researchStatement: localized(en.researchStatement, zh.researchStatement),
  researchInterests: en.researchInterests.map((item, index) => keyed("interest", index, localized(item, zh.researchInterests[index]))),
  appointments: en.appointments.map((item, index) => keyed("appointment", index, {
    year: item.year,
    institution: localized(item.institution, zh.appointments[index]?.institution),
    role: localized(item.role, zh.appointments[index]?.role),
  })),
  honors: en.honors.map((item, index) => keyed("honor", index, {
    year: item.year,
    title: localized(item.title, zh.honors[index]?.title),
  })),
  publicProjects: en.publicProjects.map((item, index) => keyed("project", index, {
    year: item.year,
    title: localized(item.title, zh.publicProjects[index]?.title),
    publiclyConfirmed: true,
  })),
  courses: en.courses.map((item, index) => keyed("course", index, {
    title: localized(item.title, zh.courses[index]?.title),
    nature: localized(item.nature, zh.courses[index]?.nature),
  })),
  academicService: localized(en.academicService, zh.academicService),
  status: "published",
};

const publicationDocuments = publications.map((item, index) => ({
  _id: `publication-${String(index + 1).padStart(3, "0")}`,
  _type: "publication",
  title: localized(item.title, "titleZh" in item ? item.titleZh : undefined),
  authors: item.authors,
  year: item.year,
  venue: item.venue,
  kind: item.kind,
  sourceUrl: "sourceUrl" in item ? item.sourceUrl : undefined,
  featured: item.featured,
  status: "published",
}));

const talkDocuments = talks.map((item, index) => ({
  _id: `talk-${String(index + 1).padStart(3, "0")}`,
  _type: "talk",
  title: localized(item.title, undefined),
  date: `${item.date.replace(".", "-")}-01`,
  type: item.type,
  host: localized(item.host, undefined),
  status: "published",
}));

const personDocuments = people.map((item, index) => ({
  _id: `person-${String(index + 1).padStart(3, "0")}`,
  _type: "person",
  name: localized(item.name, item.nameZh),
  position: localized(item.status, item.statusZh),
  category: item.category,
  order: (index + 1) * 10,
  status: "published",
}));

const documents = [profile, ...publicationDocuments, ...talkDocuments, ...personDocuments];
const json = documents.map((document) => JSON.stringify(document)).join("\n") + "\n";
await writeFile(outputPath, json, "utf8");
console.log(`Generated ${documents.length} public documents at ${outputPath}`);
