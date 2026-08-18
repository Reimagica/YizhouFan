"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { content, profileLinks, type Language } from "../lib/content";

type SiteShellProps = {
  lang: Language;
  activePath?: string;
  children: ReactNode;
};

function pathFor(lang: Language, path = "") {
  return `/${lang}${path}`;
}

export function SiteShell({ lang, activePath = "", children }: SiteShellProps) {
  const copy = content[lang];
  const pathname = usePathname();
  const resolvedActivePath = pathname.replace(`/${lang}`, "") || activePath;
  const otherLanguage = lang === "en" ? "zh" : "en";
  const siteTitle = lang === "zh" ? "个人网站" : "Personal Website";
  const links = [
    ["", copy.nav.profile],
    ["/publications", copy.nav.publications],
    ["/talks", copy.nav.talks],
    ["/teaching", copy.nav.teaching],
    ["/people", copy.nav.people],
    ["/ask", copy.nav.ask],
  ] as const;

  return (
    <div className="site-shell" lang={lang === "zh" ? "zh-CN" : "en"}>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="wordmark" href={pathFor(lang)} aria-label={`${siteTitle} - ${copy.nav.profile}`}>
            <span className="wordmark__name">{siteTitle}</span>
          </Link>

          <nav className="desktop-nav" aria-label={lang === "zh" ? "主导航" : "Primary navigation"}>
            {links.map(([path, label]) => (
              <Link
                key={path || "home"}
                className={resolvedActivePath === path || (path && resolvedActivePath.startsWith(`${path}/`)) ? "nav-link nav-link--active" : "nav-link"}
                href={pathFor(lang, path)}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link className="language-link" href={pathFor(otherLanguage, resolvedActivePath)} hrefLang={otherLanguage}>
              {lang === "en" ? "中文" : "EN"}
            </Link>
            <a className="scholar-link" href={profileLinks.scholar} target="_blank" rel="noreferrer">
              Scholar <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <nav className="mobile-nav" aria-label={lang === "zh" ? "移动端导航" : "Mobile navigation"}>
          {links.map(([path, label]) => (
            <Link
              key={path || "home"}
              className={resolvedActivePath === path || (path && resolvedActivePath.startsWith(`${path}/`)) ? "nav-link nav-link--active" : "nav-link"}
              href={pathFor(lang, path)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <p className="site-footer__name">{copy.name}</p>
          <p>{copy.footer}</p>
        </div>
        <div className="site-footer__links">
          <a href={profileLinks.email}>Email</a>
          <a href={profileLinks.scholar} target="_blank" rel="noreferrer">Google Scholar</a>
          <a href={profileLinks.orcid} target="_blank" rel="noreferrer">ORCID</a>
          <a href={profileLinks.pku} target="_blank" rel="noreferrer">PKU</a>
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <header className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-intro__lead">{lead}</p>
    </header>
  );
}
