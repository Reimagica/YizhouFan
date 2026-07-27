import Image from "next/image";
import { notFound } from "next/navigation";
import { content, isLanguage, profileLinks } from "../../lib/content";
import { getProfile } from "../../lib/cms/content";

export default async function LanguageHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const copy = content[lang];
  const zh = lang === "zh";
  const profile = await getProfile(lang);

  return (
    <div className="section-wrap profile-page">
      <aside className="profile-sidebar">
        <div className="profile-card">
          <div className="profile-photo">
            <Image
              src="/yizhou-fan.jpg"
              alt={zh ? "范逸洲老师" : "Yizhou Fan"}
              width={932}
              height={1165}
              priority
            />
          </div>
          <div className="profile-card__identity">
            <p className="eyebrow">{zh ? "个人信息" : "Profile"}</p>
            <h1>{profile.name}</h1>
            <p className="profile-role">{profile.role}</p>
            <p className="profile-affiliation">{profile.affiliation}</p>
          </div>
          <div className="profile-contact" aria-label={zh ? "联系方式" : "Contact links"}>
            <a href={profileLinks.email}><span>Email</span><strong>fyz@pku.edu.cn</strong></a>
            <a href={profileLinks.scholar} target="_blank" rel="noreferrer"><span>Google Scholar</span><strong>{zh ? "学术主页 ↗" : "Research profile ↗"}</strong></a>
            <a href={profileLinks.orcid} target="_blank" rel="noreferrer"><span>ORCID</span><strong>0000-0003-2777-1705 ↗</strong></a>
            <a href={profileLinks.pku} target="_blank" rel="noreferrer"><span>PKU</span><strong>{zh ? "北大教师主页 ↗" : "Faculty profile ↗"}</strong></a>
          </div>
        </div>
      </aside>

      <div className="profile-content">
        <header className="profile-heading">
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h2>{zh ? "研究学习者如何在人工智能时代保持判断、反思与能动性。" : "Studying how learners retain judgment, reflection, and agency in the age of AI."}</h2>
          <p>{profile.researchStatement}</p>
        </header>

        <section className="content-card long-copy">
          <div className="section-title-row"><span>01</span><h2>{zh ? "个人简介" : "Biography"}</h2></div>
          {profile.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section className="content-card">
          <div className="section-title-row"><span>02</span><h2>{zh ? "研究方向" : "Research interests"}</h2></div>
          <div className="interest-grid">
            {profile.researchInterests.map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section className="content-card">
          <div className="section-title-row"><span>03</span><h2>{zh ? "任职经历" : "Appointments"}</h2></div>
          <ol className="timeline-list">
            {profile.appointments.map((item) => (
              <li key={`${item.year}-${item.institution}`}>
                <time>{item.year}</time>
                <p><strong>{item.institution}</strong><span>{item.role}</span></p>
              </li>
            ))}
          </ol>
        </section>

        <section className="content-card">
          <div className="section-title-row"><span>04</span><h2>{zh ? "荣誉奖励" : "Honors & awards"}</h2></div>
          <ol className="timeline-list timeline-list--compact">
            {profile.honors.map((item) => <li key={`${item.year}-${item.title}`}><time>{item.year}</time><p><strong>{item.title}</strong></p></li>)}
          </ol>
        </section>

        <section className="content-card">
          <div className="section-title-row"><span>05</span><h2>{zh ? "科研项目" : "Research projects"}</h2></div>
          <ol className="timeline-list timeline-list--compact">
            {profile.publicProjects.map((item) => <li key={`${item.year}-${item.title}`}><time>{item.year}</time><p><strong>{item.title}</strong></p></li>)}
          </ol>
        </section>

        <section className="content-card" id="teaching">
          <div className="section-title-row"><span>06</span><h2>{zh ? "开设课程" : "Courses taught"}</h2></div>
          <ul className="course-list">
            {profile.courses.map((course) => <li key={`${course.title}-${course.nature}`}><strong>{course.title}</strong><span>{course.nature}</span></li>)}
          </ul>
        </section>

        <section className="content-card">
          <div className="section-title-row"><span>07</span><h2>{zh ? "学术服务" : "Academic service"}</h2></div>
          <p className="section-lead">{profile.academicService}</p>
        </section>
      </div>
    </div>
  );
}
