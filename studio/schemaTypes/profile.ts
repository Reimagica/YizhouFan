import {defineField, defineType} from "sanity";

export const profile = defineType({
  name: "profile",
  title: "个人信息",
  type: "document",
  fields: [
    defineField({name: "name", title: "姓名", type: "localizedString", validation: (rule) => rule.required()}),
    defineField({name: "role", title: "职位", type: "localizedString"}),
    defineField({name: "affiliation", title: "机构", type: "localizedString"}),
    defineField({name: "portrait", title: "公开头像", type: "image", options: {hotspot: true}}),
    defineField({name: "email", title: "公开工作邮箱", type: "string"}),
    defineField({name: "bio", title: "个人简介", type: "localizedText"}),
    defineField({name: "researchStatement", title: "研究主张", type: "localizedText"}),
    defineField({name: "researchInterests", title: "研究方向", type: "array", of: [{type: "localizedString"}]}),
    defineField({name: "appointments", title: "任职经历", type: "array", of: [{type: "object", fields: [
      defineField({name: "year", title: "时间", type: "string"}),
      defineField({name: "institution", title: "机构", type: "localizedString"}),
      defineField({name: "role", title: "职务", type: "localizedString"}),
    ]}]}),
    defineField({name: "honors", title: "荣誉", type: "array", of: [{type: "object", fields: [
      defineField({name: "year", title: "年份", type: "string"}),
      defineField({name: "title", title: "荣誉", type: "localizedString"}),
    ]}]}),
    defineField({name: "publicProjects", title: "公开科研项目白名单", type: "array", description: "只录入导师明确允许公开的项目。", of: [{type: "object", fields: [
      defineField({name: "year", title: "时间", type: "string"}),
      defineField({name: "title", title: "项目", type: "localizedString"}),
      defineField({name: "publiclyConfirmed", title: "已确认公开", type: "boolean", initialValue: false}),
    ]}]}),
    defineField({name: "courses", title: "开设课程", type: "array", of: [{type: "object", fields: [
      defineField({name: "title", title: "课程名称", type: "localizedString"}),
      defineField({name: "nature", title: "课程性质", type: "localizedString", description: "例如：北京大学研究生课程、北京大学本科生课程、MOOC。"}),
    ]}]}),
    defineField({name: "academicService", title: "学术服务", type: "localizedText"}),
    defineField({name: "status", title: "发布状态", type: "string", options: {list: ["draft", "reviewed", "published"]}, initialValue: "draft"}),
  ],
  preview: {prepare: () => ({title: "范逸洲 / Yizhou Fan", subtitle: "个人信息与履历"})},
});
