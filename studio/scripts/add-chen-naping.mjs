import {createReadStream} from "node:fs";
import {stat} from "node:fs/promises";
import {basename} from "node:path";
import {getCliClient} from "sanity/cli";

const portraitPath = process.env.CHEN_NAPING_PORTRAIT;
const apply = process.env.ADD_CHEN_NAPING_APPLY === "1";
if (!portraitPath) throw new Error("CHEN_NAPING_PORTRAIT is required.");

const file = await stat(portraitPath);
if (!file.isFile() || file.size === 0) throw new Error("Portrait file is missing or empty.");
if (file.size > 8 * 1024 * 1024) throw new Error("Portrait exceeds the 8 MB public-image limit.");
if (!/\.(?:jpe?g|png|webp)$/iu.test(portraitPath)) throw new Error("Portrait must be JPEG, PNG, or WebP.");

const client = getCliClient({apiVersion: "2026-09-01"});
const duplicate = await client.fetch(`*[_type == "person" && (
  _id == $id || name.zh == $nameZh || name.en == $nameEn
)][0]{_id, name, status}`, {id: "person-012", nameZh: "陈娜平", nameEn: "Chen Naping"});
if (duplicate) throw new Error(`Member already exists: ${JSON.stringify(duplicate)}`);

const profileId = await client.fetch('*[_type == "profile" && status == "published"][0]._id');
if (!profileId) throw new Error("Published profile document was not found.");

const profileBioZh = "范逸洲博士是北京大学教育学院助理教授、研究员，教育技术系副主任，并任莫纳什大学信息技术学院兼职研究员。其研究围绕教育与人工智能、人机交互与协同、学习分析、元认知与自我调节学习、科研智能和模拟学习展开，关注学习过程测量、机制解释与智能干预在真实教育场景中的应用。";

const profileBioEn = "Yizhou Fan is an Assistant Professor and Research Fellow at the Graduate School of Education, Deputy Director of the Department of Educational Technology, Peking University and an Adjunct Research Fellow at Monash University. He earned his Ph.D. in Educational Technology from Peking University and completed postdoctoral training at the University of Edinburgh. His research focuses on AI in Education and Science, human-AI interaction, metacognition, learning analytics, self-regulated learning and simulated learning. He has received multiple national and international honours, including the QS Reimagine Education Award and the Emerging Scholar Award from SoLAR.";
const preview = {
  _id: "person-012",
  name: {zh: "陈娜平", en: "Chen Naping"},
  memberCategory: "visiting",
  enrollmentYear: 2023,
  bio: {
    zh: "陈娜平，临床医学硕士，医学教育博士在读，汕头大学医学院讲师。主要研究方向为人工智能赋能医学生临床推理能力培养及医学生自我调节学习。",
    en: "Chen Naping, M.Med., is a lecturer at Shantou University Medical College and a Ph.D. candidate in Medical Education. Her research interests focus on using artificial intelligence to cultivate medical students’ clinical reasoning skills and self-regulated learning.",
  },
  status: "published",
};

if (!apply) {
  console.log(JSON.stringify({mode: "dry-run", portrait: {path: portraitPath, bytes: file.size}, profile: {id: profileId, bioEn: profileBioEn}, document: preview}, null, 2));
  console.log("Dry run only. Set ADD_CHEN_NAPING_APPLY=1 to upload and create the member.");
} else {
  const asset = await client.assets.upload("image", createReadStream(portraitPath), {
    filename: basename(portraitPath),
    label: "Chen Naping portrait — centered square crop",
  });
  const document = {
    ...preview,
    _type: "person",
    // Transitional fields keep the current production frontend complete until the next deployment.
    memberRole: "other",
    position: {
      zh: "2023级访问学者 · 汕头大学医学院讲师",
      en: "2023 cohort · Visiting Scholar · Lecturer, Shantou University Medical College",
    },
    portrait: {_type: "image", asset: {_type: "reference", _ref: asset._id}},
  };
  const transaction = client.transaction()
    .create(document)
    .patch(profileId, (patch) => patch.set({bio: {zh: [profileBioZh], en: [profileBioEn]}}));
  const result = await transaction.commit({visibility: "sync"});
  console.log(JSON.stringify({created: document._id, transactionId: result.transactionId, asset: asset._id, profileId}, null, 2));
}
