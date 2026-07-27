import {defineField, defineType} from "sanity";

export const publication = defineType({
  name: "publication",
  title: "学术成果",
  type: "document",
  groups: [
    {name: "content", title: "公开内容", default: true},
    {name: "automation", title: "检索与AI"},
    {name: "file", title: "文件与版权"},
  ],
  fields: [
    defineField({name: "title", title: "题名", type: "localizedString", group: "content", validation: (rule) => rule.required()}),
    defineField({name: "authors", title: "作者（按发表顺序）", type: "string", group: "content"}),
    defineField({name: "year", title: "年份", type: "number", group: "content"}),
    defineField({name: "venue", title: "期刊、会议或出版社", type: "string", group: "content"}),
    defineField({name: "kind", title: "成果类型", type: "string", group: "content", options: {list: ["Journal article", "Conference paper", "Book", "Book chapter", "Preprint", "Thesis"]}}),
    defineField({name: "doi", title: "DOI", type: "string", group: "content"}),
    defineField({name: "sourceUrl", title: "原文 / 出版社页面", type: "url", group: "content", description: "填写 DOI、出版社或会议官方页面；不要填写搜索结果页。"}),
    defineField({name: "abstract", title: "摘要", type: "localizedText", group: "content"}),
    defineField({name: "keywords", title: "关键词", type: "array", of: [{type: "string"}], group: "content"}),
    defineField({name: "bibtex", title: "BibTeX", type: "text", rows: 8, group: "content"}),
    defineField({name: "featured", title: "代表成果", type: "boolean", group: "content", initialValue: false}),
    defineField({name: "publicFile", title: "公开 PDF", type: "publicFile", group: "file"}),
    defineField({name: "automation", title: "检索任务", type: "automationState", group: "automation"}),
    defineField({name: "status", title: "发布状态", type: "string", group: "content", options: {list: ["draft", "reviewed", "published"]}, initialValue: "draft"}),
  ],
  preview: {select: {title: "title.en", subtitle: "venue", year: "year"}, prepare: ({title, subtitle, year}) => ({title, subtitle: [year, subtitle].filter(Boolean).join(" · ")})},
});
