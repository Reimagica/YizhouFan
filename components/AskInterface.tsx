"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { Language } from "../lib/content";

type Quota = { remaining: number; limit: number; blocked: boolean; reason: string | null; resetsAt: number; retryAt: number | null };

type Source = { label: string; url: string };
type Answer = { status: "answered" | "insufficient"; items: string[]; note?: string };
type Message = { role: "user" | "assistant"; text?: string; answer?: Answer; publicationLinks?: Source[]; sources?: Source[] };

export function AskInterface({ lang }: { lang: Language }) {
  const zh = lang === "zh";
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [quotaChecked, setQuotaChecked] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);
  const sending = useRef(false);
  const generation = useRef(0);
  const blocked = !quota || quota.blocked || serviceAvailable !== true;

  useEffect(() => {
    let active = true;
    let reading = false;
    async function refresh() {
      if (sending.current || reading || document.visibilityState === "hidden") return;
      reading = true;
      const version = generation.current;
      try {
        const response = await fetch("/api/ask", { cache: "no-store" });
        const result = await response.json();
        if (active && !sending.current && version === generation.current) {
          setQuota(response.ok ? result.quota : null);
          setServiceAvailable(response.ok ? Boolean(result.available) : false);
        }
      } catch {
        if (active && !sending.current && version === generation.current) { setQuota(null); setServiceAvailable(false); }
      } finally {
        reading = false;
        if (active) setQuotaChecked(true);
      }
    }
    void refresh();
    const timer = setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  const examples = zh
    ? ["范老师主要研究什么？", "有哪些生成式 AI 与学习相关的代表成果？", "课题组关注哪些研究方向？"]
    : ["What does Dr. Fan mainly research?", "Which publications focus on generative AI and learning?", "What does FanLearn Lab study?"];

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading || blocked || sending.current) return;
    sending.current = true;
    generation.current += 1;
    setMessages((current) => [...current, { role: "user", text }]);
    setQuestion("");
    setLoading(true);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, lang }),
      });
      const result = await response.json() as { quota?: Quota | null; available?: boolean; answer?: Answer; error?: string; publicationLinks?: Source[]; sources?: Source[] };
      setQuota(result.quota ?? null);
      setServiceAvailable(response.ok ? true : serviceAvailable);
      if (!response.ok || !result.answer) {
        setMessages((current) => [...current, { role: "assistant", text: result.error || (zh ? "暂时无法回答。" : "Unable to answer right now.") }]);
        return;
      }
      setMessages((current) => [...current, { role: "assistant", answer: result.answer!, publicationLinks: result.publicationLinks, sources: result.sources }]);
    } catch (error) {
      setQuota(null);
      setServiceAvailable(false);
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : (zh ? "暂时无法回答。" : "Unable to answer right now.") }]);
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="chat-shell">
      <section className="chat-panel">
        <div className="chat-history" aria-live="polite">
          {messages.length === 0 ? (
          <div className="chat-empty">
            <span>AI</span>
            <h2>{zh ? "可以从这些问题开始" : "Try one of these questions"}</h2>
            <div className="question-examples">
              {examples.map((example) => <button key={example} type="button" disabled={blocked || loading} onClick={() => setQuestion(example)}>{example}</button>)}
            </div>
          </div>
          ) : (
          <div className="message-list">
            {messages.map((message, index) => (
              <article className={`message message--${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role === "user" ? (zh ? "访客" : "You") : "AI"}</span>
                {message.text && <p>{message.text}</p>}
                {message.answer && (
                  <div className="answer-content">
                    {message.answer.status === "insufficient" && <small>{zh ? "现有资料不足" : "Insufficient public evidence"}</small>}
                    <ul>{message.answer.items.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}>{item}</li>)}</ul>
                    {message.answer.note && <p className="answer-note">{message.answer.note}</p>}
                  </div>
                )}
                {message.publicationLinks && message.publicationLinks.length > 0 && (
                  <div className="answer-sources answer-publications">
                    <strong>{zh ? "相关论文原文" : "Publication links"}</strong>
                    {message.publicationLinks.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}
                  </div>
                )}
                {message.sources && message.sources.length > 0 && (
                  <div className="answer-sources">
                    <strong>{zh ? "相关页面" : "Related pages"}</strong>
                    {message.sources.map((source) => <a key={source.url} href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{source.label} ↗</a>)}
                  </div>
                )}
              </article>
            ))}
            {loading && <article className="message message--assistant"><span>AI</span><p>{zh ? "正在核对公开资料…" : "Checking the public material…"}</p></article>}
          </div>
          )}
        </div>

        <form className="chat-composer" onSubmit={submit}>
          <label htmlFor="question">{zh ? "向 AI 助手提问" : "Ask the AI assistant"}</label>
          <div>
            <textarea disabled={blocked || loading} aria-describedby="quota-status" id="question" name="question" autoComplete="off" maxLength={800} rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={zh ? "询问导师的研究、成果、报告、教学或课题组…" : "Ask about research, publications, talks, teaching, or the lab…"} />
            <button type="submit" disabled={blocked || loading || !question.trim()}>{loading ? (zh ? "回答中…" : "Answering…") : (zh ? "发送" : "Send")}</button>
          </div>
          <p id="quota-status" role="status" aria-live="polite">
            {!quota ? (quotaChecked ? (zh ? "暂时无法读取提问额度，请稍后重试。" : "Question availability is temporarily unavailable. Please try again shortly.") : (zh ? "正在读取剩余提问次数…" : "Checking remaining questions…")) : <>
              <strong>{zh ? `本浏览器今日剩余 ${quota.remaining} / ${quota.limit} 次提问。` : `${quota.remaining} / ${quota.limit} questions remaining for this browser today.`}</strong>{" "}
              {serviceAvailable === false ? (zh ? "AI 问答暂时不可用。" : "AI Q&A is temporarily unavailable.") : quota.blocked && (quota.reason === "daily" ? (zh ? "今日可用额度已达上限，提问已暂停。" : "Today's available quota has been reached. Questions are paused.") : (zh ? "提问过于频繁，请稍后再试。" : "Questions are temporarily paused. Please try again shortly."))}
              {" "}{zh ? "每日额度于北京时间 08:00 重置。" : "Daily quota resets at 00:00 UTC."}
            </>}
          </p>
          <p>{zh ? "回答仅基于本站公开材料；本浏览器每天最多提问 8 次。" : "Answers use only public site content and state when evidence is insufficient. This browser may ask up to 8 questions per day."}</p>
        </form>
      </section>
    </div>
  );
}
