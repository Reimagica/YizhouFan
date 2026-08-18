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
      <PageIntro
        title={zh ? "AI 问答" : "AI Q&A"}
        lead={zh
          ? "AI 助手只读取本站公开的个人介绍、成果、报告、教学与团队信息，并在资料不足时明确说明。"
          : "The assistant reads only public profile, publication, talk, teaching, and people information from this site, and states when the available material is insufficient."}
      />
      <AskInterface lang={lang} />
    </div>
  );
}
