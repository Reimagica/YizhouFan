import {defineField, defineType} from "sanity";

export const localizedString = defineType({
  name: "localizedString",
  title: "中英文短文本",
  type: "object",
  fields: [
    defineField({name: "en", title: "English", type: "string"}),
    defineField({name: "zh", title: "中文", type: "string"}),
  ],
});

export const localizedText = defineType({
  name: "localizedText",
  title: "中英文长文本",
  type: "object",
  fields: [
    defineField({name: "en", title: "English", type: "text", rows: 6}),
    defineField({name: "zh", title: "中文", type: "text", rows: 6}),
  ],
});

export const publicFile = defineType({
  name: "publicFile",
  title: "已确认公开文件",
  type: "object",
  fields: [
    defineField({name: "url", title: "公开下载 URL", type: "url", description: "仅填写已通过版权与公开范围确认、位于 OSS/COS public 区域的地址。"}),
    defineField({name: "format", title: "格式", type: "string", options: {list: ["pdf", "pptx"]}}),
    defineField({name: "copyrightCleared", title: "已确认可公开", type: "boolean", initialValue: false}),
  ],
});

export const privateSource = defineType({
  name: "privateSource",
  title: "私有处理源文件",
  type: "object",
  fields: [
    defineField({name: "objectKey", title: "OSS/COS 私有对象键", type: "string", description: "只保存对象键，不保存长期有效的下载 URL。"}),
    defineField({name: "originalName", title: "原始文件名", type: "string"}),
    defineField({name: "mimeType", title: "MIME 类型", type: "string"}),
    defineField({name: "size", title: "文件大小（字节）", type: "number"}),
    defineField({name: "sha256", title: "SHA-256", type: "string"}),
  ],
});

export const publicationCandidate = defineType({
  name: "publicationCandidate",
  title: "论文候选",
  type: "object",
  fields: [
    defineField({name: "source", title: "来源", type: "string"}),
    defineField({name: "sourceId", title: "来源 ID", type: "string"}),
    defineField({name: "confidence", title: "匹配置信度", type: "number"}),
    defineField({name: "title", title: "题名", type: "string"}),
    defineField({name: "authors", title: "作者", type: "array", of: [{type: "string"}]}),
    defineField({name: "year", title: "年份", type: "number"}),
    defineField({name: "venue", title: "期刊/会议", type: "string"}),
    defineField({name: "doi", title: "DOI", type: "string"}),
    defineField({name: "url", title: "来源 URL", type: "url"}),
    defineField({name: "abstract", title: "摘要", type: "text", rows: 5}),
    defineField({name: "citationCount", title: "引用数（仅作核对）", type: "number"}),
  ],
  preview: {select: {title: "title", subtitle: "source", confidence: "confidence"}, prepare: ({title, subtitle, confidence}) => ({title, subtitle: `${subtitle ?? "unknown"} · ${Math.round((confidence ?? 0) * 100)}%`})},
});

export const automationState = defineType({
  name: "automationState",
  title: "自动化任务状态",
  type: "object",
  readOnly: true,
  fields: [
    defineField({name: "status", title: "状态", type: "string"}),
    defineField({name: "requestId", title: "请求 ID", type: "string"}),
    defineField({name: "requestedAt", title: "发起时间", type: "datetime"}),
    defineField({name: "completedAt", title: "完成时间", type: "datetime"}),
    defineField({name: "sourceCharacterCount", title: "解析字符数", type: "number"}),
    defineField({name: "candidates", title: "检索候选", type: "array", of: [{type: "publicationCandidate"}]}),
    defineField({name: "error", title: "错误", type: "text", rows: 3}),
  ],
});
