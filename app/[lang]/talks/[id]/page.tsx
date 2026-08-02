import {notFound} from "next/navigation";
import Link from "next/link";
import {PortableContent} from "../../../../components/PortableContent";
import {isLanguage} from "../../../../lib/content";
import {getTalkById} from "../../../../lib/cms/content";

export default async function TalkDetailPage({params}: {params: Promise<{lang: string; id: string}>}) {
  const {lang, id} = await params;
  if (!isLanguage(lang)) notFound();
  const talk = await getTalkById(decodeURIComponent(id));
  if (!talk) notFound();
  const zh = lang === "zh";
  const title = zh && talk.titleZh ? talk.titleZh : talk.title;
  const host = zh && talk.hostZh ? talk.hostZh : talk.host;
  const summary = zh ? (talk.summaryZh ?? talk.summary) : talk.summary;
  const body = zh ? (talk.bodyZh?.length ? talk.bodyZh : talk.body) : talk.body;
  const attachments = talk.attachments ?? [];

  return <div className="section-wrap page-body report-detail">
    <Link className="report-back" href={`/${lang}/talks`}>← {zh ? "返回学术报告" : "Back to talks"}</Link>
    <header className="report-detail__header">
      <div className="result-card__meta"><span className="type-pill">{talk.type}</span><time>{talk.date}</time></div>
      <h1>{title}</h1>
      <p>{host}</p>
      {summary && <div className="report-summary">{summary}</div>}
    </header>
    <PortableContent blocks={body} lang={lang} />
    {(attachments.length > 0 || talk.slidesUrl) && <section className="report-downloads">
      <h2>{zh ? "公开附件" : "Public downloads"}</h2>
      <div>
        {attachments.map((attachment) => <a href={attachment.url} download key={attachment.url}><strong>{(zh ? attachment.labelZh : attachment.label) ?? (zh ? "下载报告附件" : "Download attachment")}</strong>{(zh ? attachment.noteZh : attachment.note) && <span>{zh ? attachment.noteZh : attachment.note}</span>}<small>{attachment.mimeType?.includes("presentation") ? "PPTX" : "PDF"} ↓</small></a>)}
        {!attachments.length && talk.slidesUrl && <a href={talk.slidesUrl} download><strong>{zh ? "下载报告附件" : "Download attachment"}</strong><small>{talk.slidesFormat?.toUpperCase()} ↓</small></a>}
      </div>
    </section>}
  </div>;
}
