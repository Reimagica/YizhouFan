"use client";

import { useMemo, useState } from "react";
import type { Language } from "../lib/content";
import type { PublicTalk } from "../lib/cms/types";

export function TalkExplorer({ lang, talks }: { lang: Language; talks: PublicTalk[] }) {
  const zh = lang === "zh";
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  const years = [...new Set(talks.map((talk) => talk.date.split(".")[0]))].sort((a, b) => b.localeCompare(a));
  const types = [...new Set(talks.map((talk) => talk.type))];
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return talks.filter((talk) => {
      if (year && !talk.date.startsWith(year)) return false;
      if (type && talk.type !== type) return false;
      if (!term) return true;
      return [talk.title, talk.titleZh ?? "", talk.host, talk.hostZh ?? "", talk.type, talk.date, ...(talk.keywords ?? [])].join(" ").toLowerCase().includes(term);
    });
  }, [query, talks, type, year]);

  return (
    <>
      <div className="archive-search">
        <label className="search-box">
          <span>{zh ? "检索学术报告" : "Search talks"}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={zh ? "输入报告题目、主办方或类型" : "Enter a title, host, or talk type"} />
          {query && <button type="button" onClick={() => setQuery("")} aria-label={zh ? "清空检索" : "Clear search"}>×</button>}
        </label>
      </div>

      <div className="archive-layout">
      <aside className="filter-panel">
        <div className="filter-group">
          <p>{zh ? "年份" : "Year"}</p>
          <button className={!year ? "active" : ""} type="button" onClick={() => setYear(null)}>{zh ? "全部" : "All"}</button>
          {years.map((item) => <button className={year === item ? "active" : ""} type="button" key={item} onClick={() => setYear(year === item ? null : item)}>{item}</button>)}
        </div>
        <div className="filter-group">
          <p>{zh ? "类型" : "Type"}</p>
          <button className={!type ? "active" : ""} type="button" onClick={() => setType(null)}>{zh ? "全部" : "All"}</button>
          {types.map((item) => <button className={type === item ? "active" : ""} type="button" key={item} onClick={() => setType(type === item ? null : item)}>{item}</button>)}
        </div>
      </aside>

      <section className="archive-results" aria-live="polite">
        <div className="result-count"><span>{zh ? `找到 ${filtered.length} 场报告` : `${filtered.length} talks`}</span></div>
        <div className="result-list">
          {filtered.map((talk) => (
            <article className="result-card talk-card" key={`${talk.date}-${talk.title}`}>
              <div className="result-card__meta"><span className="type-pill">{talk.type}</span><time>{talk.date}</time></div>
              <h2>{zh && talk.titleZh ? talk.titleZh : talk.title}</h2>
              <p className="result-card__authors">{zh && talk.hostZh ? talk.hostZh : talk.host}</p>
              <div className="result-card__actions">
                {talk.slidesUrl ? <a href={talk.slidesUrl} download>{zh ? "下载报告文件" : "Download slides"} ↓</a> : <span className="disabled-action">{zh ? "暂无课件" : "Slides unavailable"}</span>}
              </div>
              {(zh ? talk.summaryZh : talk.summary) && <div className="abstract-panel"><strong>{zh ? "报告简介" : "Summary"}</strong><p>{zh ? talk.summaryZh : talk.summary}</p></div>}
            </article>
          ))}
          {filtered.length === 0 && <div className="empty-state">{zh ? "没有匹配结果，请调整关键词或筛选条件。" : "No matching results. Try another keyword or filter."}</div>}
        </div>
      </section>
      </div>
    </>
  );
}
