import {defineArrayMember, defineField, defineType} from "sanity";

export const talk = defineType({
  name: "talk",
  title: "学术报告",
  type: "document",
  groups: [
    {name: "content", title: "基本信息", default: true},
    {name: "body", title: "报告正文"},
    {name: "file", title: "公开附件"},
  ],
  fields: [
    defineField({name: "title", title: "报告题目", type: "localizedString", group: "content", validation: (rule) => rule.required()}),
    defineField({
      name: "date",
      title: "报告年月",
      type: "string",
      group: "content",
      description: "只精确到年月，格式为 YYYY-MM，例如 2026-07。",
      validation: (rule) => rule.required().regex(/^\d{4}-(0[1-9]|1[0-2])$/, {name: "YYYY-MM"}).error("请按 YYYY-MM 格式填写报告年月，例如 2026-07。"),
    }),
    defineField({name: "displayOrder", title: "展示顺序", type: "number", group: "content", description: "同年月报告的人工排序：日期倒序为主序，同月按此数字升序。白名单 1–11 已预填，数字越小越靠前。"}),
    defineField({name: "type", title: "报告类型（已停用）", type: "string", group: "content", hidden: true, options: {list: ["Keynote", "Invited talk", "Workshop", "Lecture", "Panel"]}, description: "导师最新要求不再区分 Keynote 与 Invited talk，前台已不展示。仅保留旧数据，不得继续编辑。"}),
    defineField({name: "host", title: "主办方与地点", type: "localizedString", group: "content"}),
    defineField({name: "summary", title: "列表页简介", type: "localizedText", group: "content", description: "用于列表页快速介绍，建议中文 80–180 字、英文 50–100 词。"}),
    defineField({name: "keywords", title: "关键词", type: "array", of: [{type: "string"}], group: "content"}),
    defineField({name: "body", title: "正文", type: "localizedReportBody", group: "body", description: "支持二/三级标题、图片、引用、外部链接、脚注与提示框。无需上传封面图。"}),
    defineField({name: "attachments", title: "访客可下载附件", type: "array", of: [defineArrayMember({type: "reportAttachment"})], group: "file"}),
    defineField({name: "publicFile", title: "旧版附件", type: "publicFile", group: "file", hidden: true, description: "仅兼容历史数据，请将新附件录入上方附件列表。"}),
    defineField({name: "status", title: "发布状态", type: "string", group: "content", options: {list: ["draft", "reviewed", "published"]}, initialValue: "draft"}),
  ],
  preview: {select: {title: "title.en", titleZh: "title.zh", subtitle: "host.en", date: "date"}, prepare: ({title, titleZh, subtitle, date}) => ({title: title || titleZh, subtitle: [date, subtitle].filter(Boolean).join(" · ")})},
});
