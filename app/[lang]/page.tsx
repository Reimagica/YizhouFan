import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content, isLanguage, profileLinks, scholarSnapshot } from "../../lib/content";
import { getProfile, getPublications } from "../../lib/cms/content";

function displayPeriod(period: string, zh: boolean) {
  const normalized = period.replace(/(\d{4})-(?=\d{4}|present)/gi, "$1–");
  return zh ? normalized.replace(/present/gi, "至今") : normalized;
}

export default async function LanguageHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const copy = content[lang];
  const zh = lang === "zh";
  const [profile, publications] = await Promise.all([getProfile(lang), getPublications()]);
  const metrics = profile.scholarMetrics ?? scholarSnapshot;
  const number = new Intl.NumberFormat(copy.locale);
  const metricItems = [
    {label: zh ? "总引用" : "Citations", value: number.format(metrics.citations), href: metrics.sourceUrl},
    {label: "h-index", value: number.format(metrics.hIndex), href: metrics.sourceUrl},
    {label: "i10-index", value: number.format(metrics.i10Index), href: metrics.sourceUrl},
    {label: zh ? "本站学术成果" : "Works on this site", value: number.format(publications.length), href: `/${lang}/publications`},
  ];

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
        <section className="content-card long-copy">
          <div className="section-title-row"><h2>{zh ? "个人简介" : "Biography"}</h2></div>
          {profile.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section className="content-card scholar-metrics" aria-labelledby="scholar-metrics-title">
          <div className="section-title-row"><h2 id="scholar-metrics-title">{zh ? "学术数据" : "Academic profile"}</h2></div>
          <div className="scholar-metrics__grid">
            {metricItems.map((item) => item.href.startsWith("/") ? (
              <Link key={item.label} href={item.href}><strong>{item.value}</strong><span>{item.label}</span></Link>
            ) : (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer"><strong>{item.value}</strong><span>{item.label}</span></a>
            ))}
          </div>
          <p className="scholar-metrics__updated">
            {zh ? `Scholar 指标截至 ${metrics.asOf}；成果总数随本站已发布内容自动更新。` : `Scholar metrics as of ${metrics.asOf}; the publication total updates with this site's published archive.`}
          </p>
        </section>

        <section className="content-card">
          <div className="section-title-row"><h2>{zh ? "研究方向" : "Research interests"}</h2></div>
          <div className="interest-grid">
            {profile.researchInterests.map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section className="content-card">
          <div className="section-title-row"><h2>{zh ? "任职经历" : "Appointments"}</h2></div>
          <ol className="timeline-list">
            {profile.appointments.map((item) => (
              <li key={`${item.year}-${item.institution}`}>
                <time>{displayPeriod(item.year, zh)}</time>
                <p><strong>{item.institution}</strong><span>{item.role}</span></p>
              </li>
            ))}
          </ol>
        </section>

        <section className="content-card">
          <div className="section-title-row"><h2>{zh ? "荣誉奖励" : "Honors & awards"}</h2></div>
          <ol className="timeline-list timeline-list--compact">
            {profile.honors.map((item) => <li key={`${item.year}-${item.title}`}><time>{item.year}</time><p><strong>{item.title}</strong></p></li>)}
          </ol>
        </section>

        <section className="content-card">
          <div className="section-title-row"><h2>{zh ? "科研项目" : "Research projects"}</h2></div>
          <ol className="timeline-list timeline-list--compact">
            {profile.publicProjects.map((item) => <li key={`${item.year}-${item.title}`}><time>{displayPeriod(item.year, zh)}</time><p><strong>{item.title}</strong></p></li>)}
          </ol>
        </section>

        <section className="content-card">
          <div className="section-title-row"><h2>{zh ? "学术服务" : "Academic service"}</h2></div>
          <p className="section-lead">{profile.academicService}</p>
        </section>
      </div>
    </div>
  );
}
