import {getCliClient} from "sanity/cli";

const client = getCliClient({apiVersion: "2025-08-01"});
const id = "course-peer-instruction";
const fields = {
  _type: "course",
  title: {en: "Peer Instruction", zh: "同伴教学法"},
  nature: {en: "Peking University MOOC", zh: "北京大学在线课程"},
  description: {
    en: "An online course for university teachers who want to improve large-class teaching through peer instruction. It introduces the method's principles and classroom process, then uses cases to help participants design concept questions, organize peer discussion, and address common implementation challenges.",
    zh: "面向希望改进大班教学的高校教师，介绍同伴教学法的基本原理与课堂流程，并通过案例帮助学习者设计概念测试题、组织同伴讨论，以及应对实际教学中的常见实施问题。",
  },
  role: {en: "Instructor", zh: "授课教师"},
  mooc: true,
  moocUrl: "https://higher.smartedu.cn/course/68b75f4dd5f9b8b6cf9dd2c6",
  order: 60,
  status: "published",
};

const existing = await client.fetch(`*[_id == $id][0]{_id, ...}`, {id});
if (!existing) {
  await client.create({_id: id, ...fields});
  console.log(`Created ${id}.`);
} else {
  await client.patch(id).set(fields).commit({visibility: "sync"});
  console.log(`Updated ${id}.`);
}
