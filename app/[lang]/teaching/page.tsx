import {notFound} from "next/navigation";
import {PageIntro} from "../../../components/SiteShell";
import {getCourses} from "../../../lib/cms/content";
import {isLanguage} from "../../../lib/content";
import {localizedMetadata} from "../../../lib/metadata";

export async function generateMetadata({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  if (!isLanguage(lang)) return {};
  return localizedMetadata(
    lang,
    "/teaching",
    "Teaching & Courses | Yizhou Fan",
    "范逸洲教授课程",
    "Explore Yizhou Fan’s six courses at Peking University, including learning analytics, academic writing, HCI, AI literacy, and peer instruction.",
    "了解范逸洲在北京大学开设的六门课程，涵盖学习分析、英文学术写作、人机交互、AI 素养与同伴教学法等主题。",
  );
}

export default async function TeachingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const zh = lang === "zh";
  const courses = await getCourses();

  return (
    <div className="section-wrap page-body teaching-page">
      <PageIntro title={zh ? "教授课程" : "Courses"} />

      <div className="teaching-grid">
        {courses.map((course) => {
          const moocLink = course.mooc ? course.moocUrl : undefined;
          return (
            <article className="course-card" key={course.id}>
              <div className="course-card__heading">
                <p className="course-card__nature">{zh ? course.natureZh : course.nature}</p>
                <h2>{zh ? course.titleZh : course.title}</h2>
              </div>
              <div className="course-card__content">
                <p>{zh ? course.descriptionZh : course.description}</p>
                {(zh ? course.roleZh : course.role) && <span className="course-card__role">{zh ? course.roleZh : course.role}</span>}
                {moocLink && <a href={moocLink} target="_blank" rel="noreferrer">
                  {zh ? "访问课程 ↗" : "View course ↗"}
                </a>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
