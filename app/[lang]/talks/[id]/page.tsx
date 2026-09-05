import {notFound} from "next/navigation";
import Link from "next/link";
import {PortableContent} from "../../../../components/PortableContent";
import {isLanguage} from "../../../../lib/content";
import {getTalkById} from "../../../../lib/cms/content";

export default async function TalkDetailPage({params}: {params: Promise<{lang: string; id: string}>}) {
  const {lang, id} = await params;
  if (!isLanguage(lang)) notFound();
  const talk = await getTalkById(decodeURIComponent(id));
  if (!talk || talk.attachments?.length || talk.slidesUrl) notFound();
  const zh = lang === "zh";
  const title = zh ? (talk.titleZh || talk.title) : (talk.title || talk.titleZh);
  const host = zh ? (talk.hostZh || talk.host) : (talk.host || talk.hostZh);
  const summary = zh ? (talk.summaryZh || talk.summary) : (talk.summary || talk.summaryZh);
  const body = zh ? (talk.bodyZh?.length ? talk.bodyZh : talk.body) : (talk.body?.length ? talk.body : talk.bodyZh);
  const attachments = talk.attachments ?? [];
  const displayDate = talk.date.match(/^(\d{4})[-.](\d{2})/)?.slice(1).join(".") ?? talk.date;

  return <div className="section-wrap page-body report-detail">
    <Link className="report-back" href={`/${lang}/talks`}>← {zh ? "返回学术报告" : "Back to talks"}</Link>
    <header className="report-detail__header">
      <div className="result-card__meta"><time>{displayDate}</time></div>
      <h1>{title}</h1>
      <p>{host}</p>
      {summary && <div className="report-summary">{summary}</div>}
    </header>
    <PortableContent blocks={body} lang={lang} />
    {(attachments.length > 0 || talk.slidesUrl) && <section className="report-downloads" id="public-downloads">
      <h2>{zh ? "公开附件" : "Public downloads"}</h2>
      <div>
        {attachments.map((attachment) => <a href={attachment.url} download key={attachment.url}><strong>{(zh ? attachment.labelZh : attachment.label) ?? (zh ? "下载报告附件" : "Download attachment")}</strong>{(zh ? attachment.noteZh : attachment.note) && <span>{zh ? attachment.noteZh : attachment.note}</span>}<small>{attachment.mimeType?.includes("pdf") ? "PDF" : attachment.mimeType?.includes("presentation") ? "PPTX" : (zh ? "文件" : "File")} ↓</small></a>)}
        {!attachments.length && talk.slidesUrl && <a href={talk.slidesUrl} download><strong>{zh ? "下载报告附件" : "Download attachment"}</strong><small>{talk.slidesFormat?.toUpperCase()} ↓</small></a>}
      </div>
    </section>}
  </div>;
}
