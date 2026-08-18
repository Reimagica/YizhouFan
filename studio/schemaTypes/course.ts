import {defineField, defineType} from "sanity";

export const course = defineType({
  name: "course",
  title: "课程",
  type: "document",
  fields: [
    defineField({name: "title", title: "课程名称", type: "localizedString", validation: (rule) => rule.required()}),
    defineField({name: "nature", title: "课程性质", type: "localizedString", description: "例如：北京大学研究生课程、北京大学本科生课程或 EdD 课程。", validation: (rule) => rule.required()}),
    defineField({name: "description", title: "课程简介", type: "localizedText", description: "只写课程定位、核心内容与学习收获，不录入周次、考核比例或办公室时间。", validation: (rule) => rule.required()}),
    defineField({name: "role", title: "授课角色", type: "localizedString", description: "可选，例如课程负责人、共同授课教师。"}),
    defineField({name: "offeredSince", title: "开设时间", type: "string", description: "可选，例如 2023 或 2023–至今。"}),
    defineField({name: "mooc", title: "是否为 MOOC", type: "boolean", initialValue: false}),
    defineField({name: "moocUrl", title: "MOOC 官方链接", type: "url", hidden: ({parent}) => !parent?.mooc}),
    defineField({name: "order", title: "排序值", type: "number", initialValue: 100, validation: (rule) => rule.required().integer().min(0)}),
    defineField({name: "status", title: "发布状态", type: "string", options: {list: ["draft", "reviewed", "published"]}, initialValue: "draft", validation: (rule) => rule.required()}),
  ],
  orderings: [{title: "页面顺序", name: "pageOrder", by: [{field: "order", direction: "asc"}]}],
  preview: {
    select: {title: "title.zh", subtitle: "nature.zh"},
    prepare: ({title, subtitle}) => ({title: title || "未命名课程", subtitle}),
  },
});
