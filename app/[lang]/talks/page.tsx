import { notFound } from "next/navigation";
import { PageIntro } from "../../../components/SiteShell";
import { TalkExplorer } from "../../../components/TalkExplorer";
import { isLanguage } from "../../../lib/content";
import { getTalks } from "../../../lib/cms/content";
import { localizedMetadata } from "../../../lib/metadata";

export async function generateMetadata({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  if (!isLanguage(lang)) return {};
  return localizedMetadata(lang, "/talks", "Talks", "学术报告", "Seminars, presentations, and public presentation materials.", "学术报告、研讨会与公开演讲材料。");
}

export default async function TalksPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const zh = lang === "zh";
  const talks = await getTalks();

  return (
    <div className="section-wrap page-body">
      <PageIntro title={zh ? "学术报告" : "Talks"} />
      <TalkExplorer lang={lang} talks={talks} />
    </div>
  );
}
