import { notFound } from "next/navigation";
import { PeopleDirectory } from "../../../components/PeopleDirectory";
import { PageIntro } from "../../../components/SiteShell";
import { isLanguage } from "../../../lib/content";
import { getPeople } from "../../../lib/cms/content";
import { localizedMetadata } from "../../../lib/metadata";

export async function generateMetadata({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  if (!isLanguage(lang)) return {};
  return localizedMetadata(
    lang,
    "/people",
    "Research Team | Yizhou Fan",
    "范逸洲研究团队成员",
    "Meet members of Yizhou Fan’s research team and view their public roles, cohort information, research interests, and biographies.",
    "查看范逸洲研究团队成员的公开姓名、身份、入学年份、研究兴趣与个人简介。",
  );
}

export default async function PeoplePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const zh = lang === "zh";
  const people = await getPeople();

  return (
    <div className="section-wrap page-body">
      <PageIntro title={zh ? "团队成员" : "Team"} />
      <PeopleDirectory lang={lang} people={people} />
    </div>
  );
}
