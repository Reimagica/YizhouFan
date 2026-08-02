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
    defineField({name: "date", title: "报告日期", type: "date", group: "content"}),
    defineField({name: "type", title: "报告类型", type: "string", group: "content", options: {list: ["Keynote", "Invited talk", "Workshop", "Lecture", "Panel"]}}),
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
