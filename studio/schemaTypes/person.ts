import {defineField, defineType} from "sanity";
import {PersonYearInput} from "../components/PersonYearInput";

const isAlumni = (document: {memberCategory?: unknown} | undefined) => document?.memberCategory === "alumni";
const validYear = (value: unknown) => Number.isInteger(value) && Number(value) >= 1900 && Number(value) <= 2100;

export const person = defineType({
  name: "person",
  title: "团队成员",
  type: "document",
  fields: [
    defineField({name: "name", title: "姓名", type: "localizedString", validation: (rule) => rule.required()}),
    defineField({
      name: "memberCategory",
      title: "成员分类",
      type: "string",
      hidden: true,
      readOnly: true,
      options: {list: [
        {title: "博士后", value: "postdoc"},
        {title: "博士研究生", value: "phd"},
        {title: "硕士研究生", value: "master"},
        {title: "访问学者", value: "visiting"},
        {title: "毕业生", value: "alumni"},
      ]},
      validation: (rule) => rule.required().error("请从左侧对应成员类别中添加成员。"),
    }),
    defineField({
      name: "enrollmentYear",
      title: "入学年份",
      type: "number",
      description: "必填",
      components: {input: PersonYearInput},
      validation: (rule) => rule.custom((value) => {
        return validYear(value) ? true : "请输入 1900–2100 之间的入学年份。";
      }),
    }),
    defineField({
      name: "alumniIdentity",
      title: "身份",
      type: "string",
      options: {
        list: [
          {title: "博士后", value: "postdoc"},
          {title: "博士研究生", value: "phd"},
          {title: "硕士研究生", value: "master"},
          {title: "访问学者", value: "visiting"},
        ],
        layout: "radio",
      },
      hidden: ({document}) => !isAlumni(document),
      validation: (rule) => rule.custom((value, context) => !isAlumni(context.document) || ["postdoc", "phd", "master", "visiting"].includes(String(value)) ? true : "请选择身份。"),
    }),
    defineField({
      name: "destination",
      title: "毕业去向",
      type: "localizedString",
      description: "请填写公开确认的中文和英文毕业去向。",
      hidden: ({document}) => !isAlumni(document),
      validation: (rule) => rule.custom((value, context) => {
        if (!isAlumni(context.document)) return true;
        const localized = value as {zh?: string; en?: string} | undefined;
        return localized?.zh?.trim() && localized.en?.trim() ? true : "请填写中文和英文毕业去向。";
      }),
    }),
    defineField({name: "bio", title: "个人与研究简介", type: "localizedText", description: "2–3 句中英文简介。"}),
    defineField({name: "portrait", title: "授权公开头像", type: "image", options: {hotspot: true}}),
    defineField({name: "status", title: "发布状态", type: "string", options: {list: ["draft", "reviewed", "published"]}, initialValue: "draft"}),

    // Legacy fields remain recognized during the production-data migration,
    // but are no longer editable or used for new member records.
    defineField({name: "position", type: "localizedString", hidden: true, readOnly: true}),
    defineField({name: "memberRole", type: "string", hidden: true, readOnly: true}),
    defineField({name: "positionMode", type: "string", hidden: true, readOnly: true}),
    defineField({name: "alumniDegree", type: "string", hidden: true, readOnly: true}),
    defineField({name: "order", type: "number", hidden: true, readOnly: true}),
    defineField({name: "category", type: "string", hidden: true, readOnly: true}),
  ],
  preview: {
    select: {
      title: "name.zh",
      category: "memberCategory",
      enrollmentYear: "enrollmentYear",
      alumniIdentity: "alumniIdentity",
      media: "portrait",
    },
    prepare({title, category, enrollmentYear, alumniIdentity, media}) {
      const alumniLabels: Record<string, string> = {
        postdoc: "博士后",
        phd: "博士研究生",
        master: "硕士研究生",
        visiting: "访问学者",
      };
      const categoryLabels: Record<string, string> = {
        postdoc: "博士后",
        phd: "博士研究生",
        master: "硕士研究生",
        visiting: "访问学者",
        alumni: alumniLabels[String(alumniIdentity)] ?? "毕业生",
      };
      const year = enrollmentYear;
      const subtitle = [year ? `${year}级` : "", categoryLabels[category] ?? "待分类"].join("");
      return {title, subtitle, media};
    },
  },
});
