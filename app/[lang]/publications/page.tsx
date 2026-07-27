import { notFound } from "next/navigation";
import { PublicationExplorer } from "../../../components/PublicationExplorer";
import { PageIntro } from "../../../components/SiteShell";
import { isLanguage } from "../../../lib/content";
import { getPublications } from "../../../lib/cms/content";

export default async function PublicationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const zh = lang === "zh";
  const publications = await getPublications();

  return (
    <div className="section-wrap page-body">
      <PageIntro
        eyebrow={zh ? "学术成果" : "Publications"}
        title={zh ? "论文与著作" : "Papers & books"}
        lead={zh
          ? "按标题、作者、期刊、年份与成果类型检索，并直接访问原文或可下载版本。"
          : "Search by title, author, venue, year, and publication type, with direct links to source pages and available files."}
      />
      <PublicationExplorer lang={lang} publications={publications} />
    </div>
  );
}
