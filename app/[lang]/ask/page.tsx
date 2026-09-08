import { notFound } from "next/navigation";
import { AskInterface } from "../../../components/AskInterface";
import { PageIntro } from "../../../components/SiteShell";
import { isLanguage } from "../../../lib/content";
import { localizedMetadata } from "../../../lib/metadata";

export async function generateMetadata({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  if (!isLanguage(lang)) return {};
  return localizedMetadata(lang, "/ask", "AI Q&A", "AI 问答", "Ask about Yizhou Fan's public research, publications, teaching, talks, and people.", "询问范逸洲公开的研究、成果、教学、报告与团队信息。");
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
