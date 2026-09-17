import { notFound } from "next/navigation";
import { PageIntro } from "../../../components/SiteShell";
import { TalkExplorer } from "../../../components/TalkExplorer";
import { isLanguage } from "../../../lib/content";
import { getTalks } from "../../../lib/cms/content";
import { localizedMetadata } from "../../../lib/metadata";

export async function generateMetadata({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  if (!isLanguage(lang)) return {};
  return localizedMetadata(
    lang,
    "/talks",
    "Academic Talks | Yizhou Fan",
    "范逸洲学术报告",
    "Browse Yizhou Fan’s academic talks by title, host, or year and access verified public presentation materials when available.",
    "按题目、主办方或年份浏览范逸洲的学术报告，并在材料获准公开时直接获取报告附件。",
  );
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
