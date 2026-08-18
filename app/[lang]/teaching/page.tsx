import {notFound} from "next/navigation";
import {PageIntro} from "../../../components/SiteShell";
import {getCourses} from "../../../lib/cms/content";
import {isLanguage} from "../../../lib/content";

export default async function TeachingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const zh = lang === "zh";
  const courses = await getCourses();

  return (
    <div className="section-wrap page-body teaching-page">
      <PageIntro
        eyebrow={zh ? "教学" : "Teaching"}
        title={zh ? "开设课程" : "Courses taught"}
        lead={zh ? "围绕学习分析、教育技术设计、学术写作与人工智能素养开展的北京大学课程。" : "Courses at Peking University spanning learning analytics, educational technology design, academic writing, and AI literacy."}
      />

      <div className="teaching-grid">
        {courses.map((course) => (
          <article className="course-card" key={course.id}>
            <p className="course-card__nature">{zh ? course.natureZh : course.nature}</p>
            <h2>{zh ? course.titleZh : course.title}</h2>
            <p>{zh ? course.descriptionZh : course.description}</p>
            {(zh ? course.roleZh : course.role) && <span className="course-card__role">{zh ? course.roleZh : course.role}</span>}
            {course.mooc && course.moocUrl && <a href={course.moocUrl} target="_blank" rel="noreferrer">{zh ? "访问课程 ↗" : "View course ↗"}</a>}
          </article>
        ))}
      </div>
    </div>
  );
}
