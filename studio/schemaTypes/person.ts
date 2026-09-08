import {defineField, defineType} from "sanity";

export const person = defineType({
  name: "person",
  title: "团队成员",
  type: "document",
  fields: [
    defineField({name: "name", title: "姓名", type: "localizedString", validation: (rule) => rule.required()}),
    defineField({name: "position", title: "身份展示文案", type: "localizedString", description: "前台显示的双语身份文案，如博士研究生；排序请使用下方“成员身份”。"}),
    defineField({
      name: "enrollmentYear",
      title: "入学年份",
      type: "number",
      description: "必填，用于成员列表按年份从近到远排序（如 2023）；该年份不在公开页面展示。",
      validation: (rule) => rule.required().integer().min(1900).max(2100),
    }),
    defineField({
      name: "memberRole",
      title: "成员身份",
      type: "string",
      description: "新增成员必填；同一入学年份内按博士生、硕转博、硕士生、已毕业排序。既有博士后记录无需选择。",
      options: {
        list: [
          {title: "硕士生", value: "master"},
          {title: "博士生", value: "phd"},
          {title: "硕转博", value: "masterToPhd"},
          {title: "已毕业", value: "graduated"},
        ],
        layout: "radio",
      },
      validation: (rule) => rule.custom((value, context) => {
        if (value) return true;
        if (context.document?.category === "postdoc") return true;
        return "请选择成员身份。";
      }),
    }),
    defineField({name: "bio", title: "个人与研究简介", type: "localizedText", description: "2–3 句中英文简介，待本人确认后补全。"}),
    defineField({name: "portrait", title: "授权公开头像", type: "image", options: {hotspot: true}}),
    defineField({name: "order", title: "人工排序值（旧字段）", type: "number", hidden: true, description: "旧数据兼容字段，前台排序不再使用。", validation: (rule) => rule.integer().min(0)}),
    defineField({name: "profileUrl", title: "个人主页（可选）", type: "url", description: "只有本人明确同意公开时才填写。"}),
    defineField({name: "publicEmail", title: "公开邮箱（可选）", type: "string", description: "只有本人明确同意公开时才填写。", validation: (rule) => rule.email()}),
    defineField({
      name: "category",
      title: "分类（旧字段，前台不再使用）",
      type: "string",
      hidden: true,
      options: {list: [
        {title: "博士后", value: "postdoc"},
        {title: "在读学生", value: "student"},
        {title: "毕业生", value: "alumni"},
      ]},
      description: "旧数据兼容字段，前台不再依赖；不要新增或编辑。",
    }),
    defineField({name: "status", title: "发布状态", type: "string", options: {list: ["draft", "reviewed", "published"]}, initialValue: "draft"}),
  ],
  preview: {select: {title: "name.zh", subtitle: "position.zh", media: "portrait"}},
});
