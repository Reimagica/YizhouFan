import {notFound} from "next/navigation";
import {PageIntro} from "../../../components/SiteShell";
import {getCourses} from "../../../lib/cms/content";
import {isLanguage} from "../../../lib/content";

const academicWritingMoocUrl = "https://www.icourse163.org/course/PKU-1449486161";

function courseMoocLink(course: {titleZh: string; moocUrl?: string}) {
  if (course.titleZh !== "智能时代的英文学术写作") return null;
  return course.moocUrl || academicWritingMoocUrl;
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
          const moocLink = courseMoocLink(course);
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
                  {zh ? "访问配套 MOOC ↗" : "View the companion MOOC ↗"}
                </a>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
