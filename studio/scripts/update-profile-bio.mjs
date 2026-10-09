import {getCliClient} from "sanity/cli";

const apply = process.env.UPDATE_PROFILE_BIO_APPLY === "1";
const client = getCliClient({apiVersion: "2026-09-01"});
const profile = await client.fetch('*[_type == "profile" && status == "published"][0]{_id, bio}');
if (!profile) throw new Error("Published profile document was not found.");

const bio = {
  zh: ["范逸洲博士是北京大学教育学院助理教授、研究员，教育技术系副主任，并任莫纳什大学信息技术学院兼职研究员。其研究围绕教育与人工智能、人机交互与协同、学习分析、元认知与自我调节学习、科研智能和模拟学习展开，关注学习过程测量、机制解释与智能干预在真实教育场景中的应用。"],
  en: ["Yizhou Fan is an Assistant Professor and Research Fellow at the Graduate School of Education, Deputy Director of the Department of Educational Technology, Peking University and an Adjunct Research Fellow at Monash University. He earned his Ph.D. in Educational Technology from Peking University and completed postdoctoral training at the University of Edinburgh. His research focuses on AI in Education and Science, human-AI interaction, metacognition, learning analytics, self-regulated learning and simulated learning. He has received multiple national and international honours, including the QS Reimagine Education Award and the Emerging Scholar Award from SoLAR."],
};

if (!apply) {
  console.log(JSON.stringify({mode: "dry-run", profileId: profile._id, currentBio: profile.bio, nextBio: bio}, null, 2));
} else {
  const result = await client.patch(profile._id).set({bio}).commit({visibility: "sync"});
  console.log(JSON.stringify({mode: "applied", profileId: result._id, transactionId: result._rev}, null, 2));
}
