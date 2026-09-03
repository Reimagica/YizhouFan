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
      <PageIntro title={zh ? "学术成果" : "Publications"} />
      <PublicationExplorer lang={lang} publications={publications} />
    </div>
  );
}
