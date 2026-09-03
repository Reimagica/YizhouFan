import { notFound } from "next/navigation";
import { PeopleDirectory } from "../../../components/PeopleDirectory";
import { PageIntro } from "../../../components/SiteShell";
import { isLanguage } from "../../../lib/content";
import { getPeople } from "../../../lib/cms/content";

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
