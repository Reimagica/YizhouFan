import { notFound } from "next/navigation";
import { PageIntro } from "../../../components/SiteShell";
import { TalkExplorer } from "../../../components/TalkExplorer";
import { isLanguage } from "../../../lib/content";
import { getTalks } from "../../../lib/cms/content";

export default async function TalksPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const zh = lang === "zh";
  const talks = await getTalks();

  return (
    <div className="section-wrap page-body">
      <PageIntro
        eyebrow={zh ? "学术报告" : "Talks"}
        title={zh ? "报告与公开课件" : "Talks & shared decks"}
        lead={zh
          ? "按题目、主办方、年份与报告类型检索，部分报告附有可下载课件。"
          : "Search by title, host, year, and talk type. Downloadable slides are included where available."}
      />
      <TalkExplorer lang={lang} talks={talks} />
    </div>
  );
}
