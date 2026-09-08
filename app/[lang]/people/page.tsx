import { notFound } from "next/navigation";
import { PeopleDirectory } from "../../../components/PeopleDirectory";
import { PageIntro } from "../../../components/SiteShell";
import { isLanguage } from "../../../lib/content";
import { getPeople } from "../../../lib/cms/content";
import { localizedMetadata } from "../../../lib/metadata";

export async function generateMetadata({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  if (!isLanguage(lang)) return {};
  return localizedMetadata(lang, "/people", "People", "团队成员", "People and researchers connected with the lab.", "课题组成员与研究人员简介。");
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
