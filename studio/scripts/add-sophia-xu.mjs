import {createReadStream} from "node:fs";
import {stat} from "node:fs/promises";
import {basename} from "node:path";
import {getCliClient} from "sanity/cli";

const portraitPath = process.env.SOPHIA_XU_PORTRAIT;
const apply = process.env.ADD_SOPHIA_XU_APPLY === "1";
if (!portraitPath) throw new Error("SOPHIA_XU_PORTRAIT is required.");

const file = await stat(portraitPath);
if (!file.isFile() || file.size === 0) throw new Error("Portrait file is missing or empty.");
if (file.size > 8 * 1024 * 1024) throw new Error("Portrait exceeds the 8 MB public-image limit.");
if (!/\.(?:jpe?g|png|webp)$/iu.test(portraitPath)) throw new Error("Portrait must be JPEG, PNG, or WebP.");

const client = getCliClient({apiVersion: "2026-09-01"});
const duplicate = await client.fetch(`*[_type == "person" && (
  _id == $id || name.zh == $nameZh || name.en == $nameEn
)][0]{_id, name, status}`, {id: "person-011", nameZh: "许淼", nameEn: "Sophia Xu"});
if (duplicate) throw new Error(`Member already exists: ${JSON.stringify(duplicate)}`);

const preview = {
  _id: "person-011",
  name: {zh: "许淼", en: "Sophia Xu"},
  memberCategory: "visiting",
  enrollmentYear: 2026,
  bio: {
    zh: "许淼，教育博士，昆明学院外国语学院讲师、研究生导师。主要研究方向为英语课程与教学论、英语教学法、英语教师教育及人工智能赋能教育教学。",
    en: "Sophia Xu, Ed.D., is a lecturer and graduate supervisor at the School of Foreign Languages, Kunming University. Her research interests include English curriculum and instruction, language teaching methodology, teacher education, and the educational applications of artificial intelligence.",
  },
  status: "published",
};

if (!apply) {
  console.log(JSON.stringify({mode: "dry-run", portrait: {path: portraitPath, bytes: file.size}, document: preview}, null, 2));
  console.log("Dry run only. Set ADD_SOPHIA_XU_APPLY=1 to upload and create the member.");
} else {
  const asset = await client.assets.upload("image", createReadStream(portraitPath), {
    filename: basename(portraitPath),
    label: "Sophia Xu portrait — left-aligned square crop",
  });
  const document = {
    ...preview,
    _type: "person",
    // Transitional fields keep the currently deployed pre-migration frontend
    // complete until the five-category release is deployed.
    memberRole: "other",
    position: {
      zh: "2026级访问学者 · 昆明学院外国语学院讲师",
      en: "2026 cohort · Visiting Scholar at Peking University · Lecturer, School of Foreign Languages, Kunming University",
    },
    portrait: {_type: "image", asset: {_type: "reference", _ref: asset._id}},
  };
  const created = await client.create(document);
  console.log(JSON.stringify({created: created._id, revision: created._rev, asset: asset._id}, null, 2));
}
