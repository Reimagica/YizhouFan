import {defineField, defineType} from "sanity";

export const person = defineType({
  name: "person",
  title: "团队成员概览",
  type: "document",
  fields: [
    defineField({name: "name", title: "姓名", type: "localizedString", validation: (rule) => rule.required()}),
    defineField({name: "position", title: "身份/状态", type: "localizedString"}),
    defineField({name: "category", title: "分类", type: "string", options: {list: [
      {title: "博士后", value: "postdoc"},
      {title: "在读学生", value: "student"},
      {title: "毕业生", value: "alumni"},
    ]}}),
    defineField({name: "portrait", title: "授权公开头像", type: "image", options: {hotspot: true}}),
    defineField({name: "order", title: "排序", type: "number", initialValue: 100}),
    defineField({name: "status", title: "发布状态", type: "string", options: {list: ["draft", "reviewed", "published"]}, initialValue: "draft"}),
  ],
  preview: {select: {title: "name.zh", subtitle: "position.zh", media: "portrait"}},
});
