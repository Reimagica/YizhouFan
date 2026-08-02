import type {DragEvent, FormEvent} from "react";
import {useToast} from "@sanity/ui";
import type {FileInputProps, ImageInputProps} from "sanity";

type Restriction = {label: string; maxBytes: number; extensions: string[]; mimeTypes: string[]};

const PUBLICATION_PDF: Restriction = {label: "论文 PDF", maxBytes: 40 * 1024 * 1024, extensions: [".pdf"], mimeTypes: ["application/pdf"]};
const REPORT_ATTACHMENT: Restriction = {label: "报告附件", maxBytes: 80 * 1024 * 1024, extensions: [".pdf", ".pptx"], mimeTypes: ["application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]};
const REPORT_IMAGE: Restriction = {label: "正文图片", maxBytes: 8 * 1024 * 1024, extensions: [".jpg", ".jpeg", ".png", ".webp"], mimeTypes: ["image/jpeg", "image/png", "image/webp"]};

function extension(name: string) {
  return name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
}

function fileError(file: File, restriction: Restriction) {
  if (file.size > restriction.maxBytes) return `${restriction.label}不能超过 ${Math.round(restriction.maxBytes / 1024 / 1024)} MB。`;
  if (!restriction.extensions.includes(extension(file.name)) || (file.type && !restriction.mimeTypes.includes(file.type))) return `${restriction.label}仅支持 ${restriction.extensions.join(" / ")}。`;
  return "";
}

function RestrictedInput({children, restriction}: {children: React.ReactNode; restriction: Restriction}) {
  const toast = useToast();
  function guard(files: FileList | null, event: {preventDefault: () => void; stopPropagation: () => void}) {
    const file = files?.[0];
    if (!file) return;
    const error = fileError(file, restriction);
    if (!error) return;
    event.preventDefault();
    event.stopPropagation();
    toast.push({status: "error", title: "文件未上传", description: error});
  }
  return <div
    onChangeCapture={(event: FormEvent<HTMLDivElement>) => guard((event.target as HTMLInputElement).files, event)}
    onDropCapture={(event: DragEvent<HTMLDivElement>) => guard(event.dataTransfer.files, event)}
  >{children}</div>;
}

export function PublicationPdfInput(props: FileInputProps) {
  return <RestrictedInput restriction={PUBLICATION_PDF}>{props.renderDefault(props)}</RestrictedInput>;
}

export function ReportAttachmentInput(props: FileInputProps) {
  return <RestrictedInput restriction={REPORT_ATTACHMENT}>{props.renderDefault(props)}</RestrictedInput>;
}

export function ReportImageInput(props: ImageInputProps) {
  return <RestrictedInput restriction={REPORT_IMAGE}>{props.renderDefault(props)}</RestrictedInput>;
}
