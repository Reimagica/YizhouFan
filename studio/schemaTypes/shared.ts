import {defineArrayMember, defineField, defineType} from "sanity";
import {PublicationPdfInput, ReportAttachmentInput, ReportImageInput} from "../components/RestrictedAssetInputs";

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
  title: "已确认公开的论文 PDF",
  type: "object",
  fields: [
    defineField({name: "file", title: "PDF 文件", type: "file", options: {accept: "application/pdf", storeOriginalFilename: false}, components: {input: PublicationPdfInput}, description: "上传前请将文件改为不含个人信息的简洁名称；最大 40 MB。", validation: (rule) => rule.custom(async (value, context) => {
      const reference = (value as {asset?: {_ref?: string}} | undefined)?.asset?._ref;
      if (!reference) return true;
      const asset = await context.getClient({apiVersion: "2026-08-01"}).fetch<{size?: number; mimeType?: string} | null>(`*[_id == $id][0]{size,mimeType}`, {id: reference});
      if (asset?.mimeType !== "application/pdf") return "论文附件仅支持 PDF。";
      return !asset?.size || asset.size <= 40 * 1024 * 1024 ? true : "论文 PDF 不能超过 40 MB。";
    })}),
    defineField({name: "url", title: "旧版外部 URL", type: "url", hidden: true, description: "兼容已录入数据，新文件请直接上传到上方 Sanity 文件字段。"}),
    defineField({name: "copyrightCleared", title: "已确认版权与公开范围", type: "boolean", initialValue: false, validation: (rule) => rule.required().custom((value, context) => {
      const parent = context.parent as {file?: unknown; url?: string} | undefined;
      return !parent?.file && !parent?.url ? true : value === true ? true : "有文件时必须确认可公开，前台才会显示下载入口。";
    })}),
  ],
});

export const reportAttachment = defineType({
  name: "reportAttachment",
  title: "报告附件",
  type: "object",
  fields: [
    defineField({name: "label", title: "附件名称", type: "localizedString", description: "例如：演示文稿 / Presentation slides"}),
    defineField({name: "file", title: "PDF 或 PPTX", type: "file", options: {accept: "application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation", storeOriginalFilename: false}, components: {input: ReportAttachmentInput}, validation: (rule) => rule.required().custom(async (value, context) => {
      const reference = (value as {asset?: {_ref?: string}} | undefined)?.asset?._ref;
      if (!reference) return true;
      const asset = await context.getClient({apiVersion: "2026-08-01"}).fetch<{size?: number; mimeType?: string} | null>(`*[_id == $id][0]{size,mimeType}`, {id: reference});
      const accepted = ["application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
      if (asset?.mimeType && !accepted.includes(asset.mimeType)) return "报告附件仅支持 PDF 或 PPTX。";
      return !asset?.size || asset.size <= 80 * 1024 * 1024 ? true : "报告附件不能超过 80 MB。";
    }), description: "最大 80 MB；建议优先提供 PDF，确保访客无需特定软件也能查看。"}),
    defineField({name: "copyrightCleared", title: "已确认版权与公开范围", type: "boolean", initialValue: false, validation: (rule) => rule.required().custom((value) => value === true ? true : "只有确认可公开的附件才会显示在网站上。")}),
    defineField({name: "note", title: "附件说明", type: "localizedString"}),
  ],
  preview: {select: {title: "label.zh", subtitle: "file.asset.originalFilename"}},
});

export const reportImage = defineType({
  name: "reportImage",
  title: "正文图片",
  type: "image",
  options: {accept: "image/jpeg,image/png,image/webp", storeOriginalFilename: false, hotspot: true},
  components: {input: ReportImageInput},
  validation: (rule) => rule.custom(async (value, context) => {
    const reference = (value as {asset?: {_ref?: string}} | undefined)?.asset?._ref;
    if (!reference) return true;
    const asset = await context.getClient({apiVersion: "2026-08-01"}).fetch<{size?: number; mimeType?: string} | null>(`*[_id == $id][0]{size,mimeType}`, {id: reference});
    if (asset?.mimeType && !["image/jpeg", "image/png", "image/webp"].includes(asset.mimeType)) return "正文图片仅支持 JPEG、PNG 或 WebP，不接受 SVG。";
    return !asset?.size || asset.size <= 8 * 1024 * 1024 ? true : "正文图片不能超过 8 MB。";
  }),
  fields: [
    defineField({name: "alt", title: "替代文本", type: "localizedString", validation: (rule) => rule.required(), description: "简要说明图片内容，供无障碍访问和图片加载失败时使用。"}),
    defineField({name: "caption", title: "图注", type: "localizedString"}),
    defineField({name: "credit", title: "来源 / 版权说明", type: "string"}),
    defineField({name: "sourceUrl", title: "来源链接", type: "url"}),
  ],
});

export const reportNote = defineType({
  name: "reportNote",
  title: "提示框",
  type: "object",
  fields: [
    defineField({name: "title", title: "标题", type: "string"}),
    defineField({name: "text", title: "内容", type: "text", rows: 4, validation: (rule) => rule.required()}),
  ],
});

export const reportBody = defineType({
  name: "reportBody",
  title: "报告正文",
  type: "array",
  of: [
    defineArrayMember({type: "block", styles: [
      {title: "正文", value: "normal"},
      {title: "二级标题", value: "h2"},
      {title: "三级标题", value: "h3"},
      {title: "引用", value: "blockquote"},
    ], marks: {
      decorators: [{title: "加粗", value: "strong"}, {title: "斜体", value: "em"}],
      annotations: [
        defineArrayMember({name: "externalLink", title: "外部链接", type: "object", fields: [defineField({name: "href", title: "URL", type: "url", validation: (rule) => rule.required()}), defineField({name: "newTab", title: "新标签页打开", type: "boolean", initialValue: true})]}),
        defineArrayMember({name: "footnote", title: "脚注", type: "object", fields: [defineField({name: "text", title: "脚注内容", type: "text", rows: 3, validation: (rule) => rule.required()})]}),
      ],
    }}),
    defineArrayMember({type: "reportImage"}),
    defineArrayMember({type: "reportNote"}),
  ],
});

export const localizedReportBody = defineType({
  name: "localizedReportBody",
  title: "中英文报告正文",
  type: "object",
  fields: [defineField({name: "en", title: "English", type: "reportBody"}), defineField({name: "zh", title: "中文", type: "reportBody"})],
});
