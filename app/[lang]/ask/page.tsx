import { notFound } from "next/navigation";
import { AskInterface } from "../../../components/AskInterface";
import { PageIntro } from "../../../components/SiteShell";
import { isLanguage } from "../../../lib/content";
import { localizedMetadata } from "../../../lib/metadata";

export async function generateMetadata({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  if (!isLanguage(lang)) return {};
  return localizedMetadata(
    lang,
    "/ask",
    "AI Q&A | Yizhou Fan",
    "范逸洲 AI 问答",
    "Ask the site’s AI assistant about public information on Yizhou Fan’s research, publications, teaching, talks, and team.",
    "使用本站 AI 助手查询范逸洲公开的研究、学术成果、课程、报告与团队信息。",
    {index: false},
  );
}

export default async function AskPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const zh = lang === "zh";

  return (
    <div className="section-wrap page-body page-body--chat">
      <PageIntro title={zh ? "AI 问答" : "AI Q&A"} />
      <AskInterface lang={lang} />
    </div>
  );
}
