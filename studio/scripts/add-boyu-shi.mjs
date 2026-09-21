import {createReadStream} from "node:fs";
import {stat} from "node:fs/promises";
import {basename} from "node:path";
import {getCliClient} from "sanity/cli";

const portraitPath = process.env.BOYU_SHI_PORTRAIT;
const apply = process.env.ADD_BOYU_SHI_APPLY === "1";
if (!portraitPath) throw new Error("BOYU_SHI_PORTRAIT is required.");

const file = await stat(portraitPath);
if (!file.isFile() || file.size === 0) throw new Error("Portrait file is missing or empty.");
if (file.size > 8 * 1024 * 1024) throw new Error("Portrait exceeds the 8 MB public-image limit.");
if (!/\.(?:jpe?g|png|webp)$/iu.test(portraitPath)) throw new Error("Portrait must be JPEG, PNG, or WebP.");

const client = getCliClient({apiVersion: "2026-09-01"});
const duplicate = await client.fetch(`*[_type == "person" && (
  _id == $id || name.zh == $nameZh || name.en == $nameEn
)][0]{_id, name, status}`, {id: "person-010", nameZh: "石博羽", nameEn: "Boyu Shi"});
if (duplicate) throw new Error(`Member already exists: ${JSON.stringify(duplicate)}`);

const preview = {
  _id: "person-010",
  name: {zh: "石博羽", en: "Boyu Shi"},
  memberCategory: "master",
  enrollmentYear: 2026,
  bio: {
    zh: "本科毕业于北京师范大学教育技术学专业，研究方向聚焦人工智能教育应用与学习分析，关注生成式人工智能、智能体技术与学习者认知、元认知过程的交互机制。",
    en: "She graduated from Beijing Normal University, where she majored in Educational Technology. Her research interests focus on AI in education, learning analytics, generative AI, and intelligent agents, with particular attention to human-AI interaction and learning processes.",
  },
  status: "published",
};

if (!apply) {
  console.log(JSON.stringify({mode: "dry-run", portrait: {path: portraitPath, bytes: file.size}, document: preview}, null, 2));
  console.log("Dry run only. Set ADD_BOYU_SHI_APPLY=1 to upload and create the member.");
} else {
  const asset = await client.assets.upload("image", createReadStream(portraitPath), {
    filename: basename(portraitPath),
    label: "Boyu Shi portrait",
  });
  const document = {
    ...preview,
    _type: "person",
    // Transitional fields keep the currently deployed pre-migration frontend
    // complete until the five-category release is deployed.
    memberRole: "master",
    position: {zh: "2026级硕士研究生", en: "2026 cohort · Master’s student"},
    portrait: {_type: "image", asset: {_type: "reference", _ref: asset._id}},
  };
  const created = await client.create(document);
  console.log(JSON.stringify({created: created._id, revision: created._rev, asset: asset._id}, null, 2));
}
