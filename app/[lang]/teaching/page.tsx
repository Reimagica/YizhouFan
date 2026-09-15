import {notFound} from "next/navigation";
import {PageIntro} from "../../../components/SiteShell";
import {getCourses} from "../../../lib/cms/content";
import {isLanguage} from "../../../lib/content";
import {localizedMetadata} from "../../../lib/metadata";

export async function generateMetadata({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  if (!isLanguage(lang)) return {};
  return localizedMetadata(lang, "/teaching", "Teaching", "教授课程", "Courses in learning analytics, educational technology, academic writing, HCI, AI literacy, and peer instruction.", "学习分析、教育技术、英文学术写作、人机交互、AI 素养与同伴教学法课程。");
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
