import { notFound } from "next/navigation";
import { PublicationExplorer } from "../../../components/PublicationExplorer";
import { PageIntro } from "../../../components/SiteShell";
import { isLanguage } from "../../../lib/content";
import { getPublications } from "../../../lib/cms/content";
import { localizedMetadata } from "../../../lib/metadata";

export async function generateMetadata({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  if (!isLanguage(lang)) return {};
  return localizedMetadata(
    lang,
    "/publications",
    "Publications & Open PDFs | Yizhou Fan",
    "范逸洲学术成果与公开 PDF",
    "Search Yizhou Fan’s publications and books, read abstracts and citation details, copy BibTeX, and download copyright-cleared PDFs.",
    "检索范逸洲的论文与著作，查看摘要和引文信息、复制 BibTeX，并下载已确认可公开的 PDF 全文。",
  );
}

export default async function PublicationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const zh = lang === "zh";
  const publications = await getPublications();

  return (
    <div className="section-wrap page-body">
      <PageIntro title={zh ? "学术成果" : "Publications"} />
      <PublicationExplorer lang={lang} publications={publications} />
    </div>
  );
}
