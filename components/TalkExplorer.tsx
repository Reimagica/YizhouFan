"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Language } from "../lib/content";
import type { PublicTalk } from "../lib/cms/types";

function talkYear(date: string) {
  return date.match(/^\d{4}/)?.[0] ?? date;
}

function displayTalkDate(date: string) {
  const match = date.match(/^(\d{4})[-.](\d{2})/);
  return match ? `${match[1]}.${match[2]}` : date;
}

function localizedTalkTitle(talk: PublicTalk, lang: Language) {
  return lang === "zh" ? (talk.titleZh || talk.title) : (talk.title || talk.titleZh || "");
}

function localizedTalkHost(talk: PublicTalk, lang: Language) {
  return lang === "zh" ? (talk.hostZh || talk.host) : (talk.host || talk.hostZh || "");
}

function hasTalkDetails(talk: PublicTalk, lang: Language) {
  const summary = lang === "zh" ? (talk.summaryZh || talk.summary) : (talk.summary || talk.summaryZh);
  const body = lang === "zh" ? (talk.bodyZh?.length ? talk.bodyZh : talk.body) : (talk.body?.length ? talk.body : talk.bodyZh);
  return Boolean(summary?.trim() || body?.length || talk.attachments?.length || talk.slidesUrl);
}

export function TalkExplorer({ lang, talks }: { lang: Language; talks: PublicTalk[] }) {
  const zh = lang === "zh";
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string | null>(null);

  const years = [...new Set(talks.map((talk) => talkYear(talk.date)))].sort((a, b) => b.localeCompare(a));
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return talks.filter((talk) => {
      if (year && !talk.date.startsWith(year)) return false;
      if (!term) return true;
      return [talk.title, talk.titleZh ?? "", talk.host, talk.hostZh ?? "", talk.date, ...(talk.keywords ?? [])].join(" ").toLowerCase().includes(term);
    });
  }, [query, talks, year]);

  return (
    <>
      <div className="archive-search">
        <label className="search-box">
          <span>{zh ? "检索学术报告" : "Search talks"}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={zh ? "输入报告题目或主办方" : "Enter a title or host"} />
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
      </aside>

      <section className="archive-results" aria-live="polite">
        <div className="result-count"><span>{zh ? `找到 ${filtered.length} 场报告` : `${filtered.length} talks`}</span></div>
        <div className="result-list">
          {filtered.map((talk) => {
            const title = localizedTalkTitle(talk, lang);
            const host = localizedTalkHost(talk, lang);
            const hasDetails = hasTalkDetails(talk, lang);
            const summary = lang === "zh" ? (talk.summaryZh || talk.summary) : (talk.summary || talk.summaryZh);
            return <article className="result-card talk-card" key={talk.id}>
              <div className="result-card__meta"><time>{displayTalkDate(talk.date)}</time></div>
              <h2>{hasDetails ? <Link href={`/${lang}/talks/${encodeURIComponent(talk.id)}`}>{title}</Link> : title}</h2>
              <p className="result-card__authors">{host}</p>
              {hasDetails && <div className="result-card__actions">
                <Link href={`/${lang}/talks/${encodeURIComponent(talk.id)}`}>{zh ? "查看报告详情" : "View details"} →</Link>
                {talk.slidesUrl ? <a href={talk.slidesUrl} download>{zh ? "下载报告文件" : "Download slides"} ↓</a> : null}
              </div>}
              {summary && <div className="abstract-panel"><strong>{zh ? "报告简介" : "Summary"}</strong><p>{summary}</p></div>}
            </article>
          })}
          {filtered.length === 0 && <div className="empty-state">{zh ? "没有匹配结果，请调整关键词或筛选条件。" : "No matching results. Try another keyword or filter."}</div>}
        </div>
      </section>
      </div>
    </>
  );
}
