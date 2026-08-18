"use client";

import { useMemo, useState } from "react";
import { profileLinks, type Language } from "../lib/content";
import type { PublicPublication } from "../lib/cms/types";
import {publicationToBibTeX} from "../lib/bibtex";

const kindLabels: Record<string, string> = {
  "Journal article": "期刊论文",
  "Conference paper": "会议论文",
  Book: "学术著作",
  "Book chapter": "书籍章节",
  Preprint: "预印本",
  Thesis: "学位论文",
};

function localizedKind(kind: string, zh: boolean) {
  return zh ? (kindLabels[kind] ?? kind) : kind;
}

function localizedTitle(publication: PublicPublication, lang: Language) {
  // Each locale prefers its own field, falling back to the other so a Chinese-only
  // publication (no fabricated English title) still displays its original title on
  // the English page, and vice versa.
  return lang === "zh" ? (publication.titleZh || publication.title) : (publication.title || publication.titleZh);
}

export function PublicationExplorer({ lang, publications }: { lang: Language; publications: PublicPublication[] }) {
  const zh = lang === "zh";
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [kind, setKind] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const years = [...new Set(publications.map((item) => item.year))].sort((a, b) => b - a);
  const kinds = [...new Set(publications.map((item) => item.kind))];
  const languages = [...new Set(publications.map((item) => item.language).filter(Boolean))] as string[];
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return publications.filter((item) => {
      if (year && item.year !== year) return false;
      if (kind && item.kind !== kind) return false;
      if (language && item.language !== language) return false;
      if (!term) return true;
      const target = [item.title, item.titleZh ?? "", item.authors, item.venue, item.kind, ...(item.keywords ?? [])].join(" ").toLowerCase();
      return target.includes(term);
    });
  }, [kind, language, publications, query, year]);

  const copyBibTeX = async (publication: PublicPublication) => {
    await navigator.clipboard.writeText(publicationToBibTeX(publication));
    setCopied(publication.id);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <>
      <div className="archive-search">
        <label className="search-box">
          <span>{zh ? "检索学术成果" : "Search publications"}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={zh ? "输入标题、作者、期刊或关键词" : "Enter a title, author, venue, or keyword"}
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label={zh ? "清空检索" : "Clear search"}>×</button>}
        </label>
      </div>

      <div className="archive-layout">
      <aside className="filter-panel">
        <div className="filter-group">
          <p>{zh ? "年份" : "Year"}</p>
          <button aria-pressed={!year} className={!year ? "active" : ""} type="button" onClick={() => setYear(null)}>{zh ? "全部" : "All"}</button>
          {years.map((item) => <button aria-pressed={year === item} className={year === item ? "active" : ""} type="button" key={item} onClick={() => setYear(year === item ? null : item)}>{item}</button>)}
        </div>

        <div className="filter-group">
          <p>{zh ? "类型" : "Type"}</p>
          <button aria-pressed={!kind} className={!kind ? "active" : ""} type="button" onClick={() => setKind(null)}>{zh ? "全部" : "All"}</button>
          {kinds.map((item) => <button aria-pressed={kind === item} className={kind === item ? "active" : ""} type="button" key={item} onClick={() => setKind(kind === item ? null : item)}>{localizedKind(item, zh)}</button>)}
        </div>

        {languages.length > 1 && (
          <div className="filter-group">
            <p>{zh ? "语言" : "Language"}</p>
            <button aria-pressed={!language} className={!language ? "active" : ""} type="button" onClick={() => setLanguage(null)}>{zh ? "全部" : "All"}</button>
            {languages.map((item) => <button aria-pressed={language === item} className={language === item ? "active" : ""} type="button" key={item} onClick={() => setLanguage(language === item ? null : item)}>{item === "zh" ? "中文" : "English"}</button>)}
          </div>
        )}
      </aside>

      <section className="archive-results" aria-live="polite">
        <div className="result-count">
          <span>{zh ? `找到 ${filtered.length} 项成果` : `${filtered.length} results`}</span>
          <a href={profileLinks.scholar} target="_blank" rel="noreferrer">Google Scholar ↗</a>
        </div>

        <div className="result-list">
          {filtered.map((publication) => {
            const title = localizedTitle(publication, lang);
            const isOpen = expanded === publication.id;
            const pdfUrl = publication.pdfUrl ?? null;
            const sourceUrl = publication.sourceUrl ?? (publication.doi ? `https://doi.org/${publication.doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")}` : null);

            return (
              <article className="result-card" key={publication.id}>
                <div className="result-card__meta">
                  <span className="type-pill">{localizedKind(publication.kind, zh)}</span>
                  <span>{publication.venue}</span>
                  <time>{publication.year}</time>
                </div>
                <h2>{title}</h2>
                <p className="result-card__authors">{publication.authors}</p>
                <div className="result-card__actions">
                  {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">{zh ? "查看原文" : "View source"} ↗</a>}
                  {pdfUrl ? (
                    <a href={pdfUrl} download>{zh ? "下载 PDF" : "Download PDF"} ↓</a>
                  ) : (
                    <span className="disabled-action" title={zh ? "公开版本待确认" : "Public version pending"}>{zh ? "PDF 待补" : "PDF pending"}</span>
                  )}
                  <button type="button" onClick={() => copyBibTeX(publication)}>{copied === publication.id ? (zh ? "已复制" : "Copied") : "BibTeX"}</button>
                  <button type="button" onClick={() => setExpanded(isOpen ? null : publication.id)}>{isOpen ? (zh ? "收起摘要" : "Hide abstract") : (zh ? "展开摘要" : "Show abstract")}</button>
                </div>
                {isOpen && (
                <div className="abstract-panel">
                    <strong>{zh ? "摘要" : "Abstract"}</strong>
                    <p>{(zh ? (publication.abstractZh || publication.abstract) : (publication.abstract || publication.abstractZh)) ?? (zh ? "暂无摘要。" : "Abstract not available.")}</p>
                  </div>
                )}
              </article>
            );
          })}
          {filtered.length === 0 && <div className="empty-state">{zh ? "没有匹配结果，请调整关键词或筛选条件。" : "No matching results. Try another keyword or filter."}</div>}
        </div>
      </section>
      </div>
    </>
  );
}
