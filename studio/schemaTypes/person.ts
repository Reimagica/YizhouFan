import {defineField, defineType} from "sanity";
import {EnrollmentYearInput} from "../components/EnrollmentYearInput";
import {PersonPositionInput} from "../components/PersonPositionInput";

export const person = defineType({
  name: "person",
  title: "团队成员",
  type: "document",
  fields: [
    defineField({name: "name", title: "姓名", type: "localizedString", validation: (rule) => rule.required()}),
    defineField({
      name: "enrollmentYear",
      title: "入学年份",
      type: "number",
      description: "必填，用于成员排序",
      components: {input: EnrollmentYearInput},
      validation: (rule) => rule.required().integer().min(1900).max(2100),
    }),
    defineField({
      name: "memberRole",
      title: "成员身份",
      type: "string",
      description: "必填，仅用于排序，不在前台展示；同一入学年份内按博士后、博士生、硕转博、硕士生、已毕业、其他排序。",
      options: {
        list: [
          {title: "博士后", value: "postdoc"},
          {title: "博士生", value: "phd"},
          {title: "硕转博", value: "masterToPhd"},
          {title: "硕士生", value: "master"},
          {title: "已毕业", value: "graduated"},
          {title: "其他", value: "other"},
        ],
      },
      validation: (rule) => rule.required().error("请选择成员身份。"),
    }),
    defineField({name: "position", title: "身份/状态", type: "localizedString", description: "自动填入后可自行修改中文和英文内容；选择毕业生或其他时不添加入学年份。", components: {input: PersonPositionInput}, validation: (rule) => rule.custom((value) => value?.zh?.trim() && value?.en?.trim() ? true : "请填写中文和英文身份/状态。")}),
    // Legacy drafts may still contain this field from the previous two-mode editor.
    // Keep it hidden so Sanity recognizes the data without exposing the old control.
    defineField({name: "positionMode", type: "string", hidden: true, readOnly: true}),
    defineField({name: "bio", title: "个人与研究简介", type: "localizedText", description: "2–3 句中英文简介。"}),
    defineField({name: "portrait", title: "授权公开头像", type: "image", options: {hotspot: true}}),
    defineField({name: "order", title: "排列顺序", type: "number", readOnly: true, description: "按入学年份和成员身份自动生成，暂不可修改。", validation: (rule) => rule.integer().min(0)}),
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
