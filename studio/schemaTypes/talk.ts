import {defineField, defineType} from "sanity";

export const talk = defineType({
  name: "talk",
  title: "学术报告",
  type: "document",
  groups: [
    {name: "content", title: "公开内容", default: true},
    {name: "automation", title: "PPT与AI"},
    {name: "file", title: "文件与公开范围"},
  ],
  fields: [
    defineField({name: "title", title: "报告题目", type: "localizedString", group: "content", validation: (rule) => rule.required()}),
    defineField({name: "date", title: "报告日期", type: "date", group: "content"}),
    defineField({name: "type", title: "报告类型", type: "string", group: "content", options: {list: ["Keynote", "Invited talk", "Workshop", "Lecture", "Panel"]}}),
    defineField({name: "host", title: "主办方与地点", type: "localizedString", group: "content"}),
    defineField({name: "summary", title: "人工确认后的简介", type: "localizedText", group: "content"}),
    defineField({name: "keywords", title: "关键词", type: "array", of: [{type: "string"}], group: "content"}),
    defineField({name: "privateSource", title: "私有 PPTX 来源", type: "privateSource", group: "automation"}),
    defineField({name: "aiDraft", title: "AI生成草稿（请人工修改后复制到公开简介）", type: "object", group: "automation", fields: [
      defineField({name: "summaryZh", title: "中文简介草稿", type: "text", rows: 6}),
      defineField({name: "summaryEn", title: "English summary draft", type: "text", rows: 6}),
      defineField({name: "keywordsZh", title: "中文关键词", type: "array", of: [{type: "string"}]}),
      defineField({name: "keywordsEn", title: "English keywords", type: "array", of: [{type: "string"}]}),
      defineField({name: "outlineZh", title: "中文提纲", type: "array", of: [{type: "string"}]}),
      defineField({name: "outlineEn", title: "English outline", type: "array", of: [{type: "string"}]}),
      defineField({name: "warnings", title: "缺失信息与风险提示", type: "array", of: [{type: "string"}]}),
    ]}),
    defineField({name: "automation", title: "处理任务", type: "automationState", group: "automation"}),
    defineField({name: "publicFile", title: "已确认公开的 PPT/PDF", type: "publicFile", group: "file"}),
    defineField({name: "status", title: "发布状态", type: "string", group: "content", options: {list: ["draft", "reviewed", "published"]}, initialValue: "draft"}),
  ],
  preview: {select: {title: "title.en", subtitle: "host.en", date: "date"}, prepare: ({title, subtitle, date}) => ({title, subtitle: [date, subtitle].filter(Boolean).join(" · ")})},
});
