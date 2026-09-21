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
    "Meet the postdoctoral fellows, Ph.D. students, master’s students, visiting scholars, and alumni in Yizhou Fan’s research team.",
    "查看范逸洲研究团队的博士后、博士研究生、硕士研究生、访问学者与毕业生信息。",
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
