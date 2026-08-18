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
        eyebrow={zh ? "学术" : "Academic"}
        title={zh ? "学术报告" : "Talks"}
        lead={zh ? "可按题目、主办方或年份检索学术报告。" : "Search talks by title, host, or year."}
      />
      <TalkExplorer lang={lang} talks={talks} />
    </div>
  );
}
