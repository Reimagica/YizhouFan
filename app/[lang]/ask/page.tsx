import { notFound } from "next/navigation";
import { AskInterface } from "../../../components/AskInterface";
import { PageIntro } from "../../../components/SiteShell";
import { isLanguage } from "../../../lib/content";

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
