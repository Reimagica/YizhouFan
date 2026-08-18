import {notFound} from "next/navigation";
import {PageIntro} from "../../../components/SiteShell";
import {getCourses} from "../../../lib/cms/content";
import {isLanguage} from "../../../lib/content";

const academicWritingMoocUrl = "https://www.icourse163.org/course/PKU-1449486161";

function courseMoocLink(course: {titleZh: string; moocUrl?: string}) {
  if (course.moocUrl) return {href: course.moocUrl, exact: true};
  if (course.titleZh === "智能时代的英文学术写作") return {href: academicWritingMoocUrl, exact: true};
  return {
    href: `https://www.icourse163.org/search.htm?search=${encodeURIComponent(course.titleZh)}`,
    exact: false,
  };
}

export default async function TeachingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const zh = lang === "zh";
  const courses = await getCourses();

  return (
    <div className="section-wrap page-body teaching-page">
      <PageIntro
        title={zh ? "教授课程" : "Courses"}
        lead={zh ? "围绕学习分析、教育技术设计、学术写作与人工智能素养开展的北京大学课程。" : "Courses at Peking University spanning learning analytics, educational technology design, academic writing, and AI literacy."}
      />

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
                <a href={moocLink.href} target="_blank" rel="noreferrer">
                  {moocLink.exact
                    ? (zh ? "访问配套 MOOC ↗" : "View the companion MOOC ↗")
                    : (zh ? "在中国大学 MOOC 检索相关课程 ↗" : "Find related courses on China University MOOC ↗")}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
