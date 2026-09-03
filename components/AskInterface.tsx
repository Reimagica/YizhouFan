"use client";

import { FormEvent, useState } from "react";
import type { Language } from "../lib/content";

type Source = { label: string; url: string };
type Answer = { status: "answered" | "insufficient"; items: string[]; note?: string };
type Message = { role: "user" | "assistant"; text?: string; answer?: Answer; publicationLinks?: Source[]; sources?: Source[] };

export function AskInterface({ lang }: { lang: Language }) {
  const zh = lang === "zh";
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const examples = zh
    ? ["范老师主要研究什么？", "有哪些生成式 AI 与学习相关的代表成果？", "课题组关注哪些研究方向？"]
    : ["What does Dr. Fan mainly research?", "Which publications focus on generative AI and learning?", "What does FanLearn Lab study?"];

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setQuestion("");
    setLoading(true);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, lang }),
      });
      const result = await response.json() as { answer?: Answer; error?: string; publicationLinks?: Source[]; sources?: Source[] };
      if (!response.ok || !result.answer) throw new Error(result.error || (zh ? "暂时无法回答。" : "Unable to answer right now."));
      setMessages((current) => [...current, { role: "assistant", answer: result.answer!, publicationLinks: result.publicationLinks, sources: result.sources }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : (zh ? "暂时无法回答。" : "Unable to answer right now.") }]);
    } finally {
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
              {examples.map((example) => <button key={example} type="button" onClick={() => setQuestion(example)}>{example}</button>)}
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
            <textarea id="question" name="question" autoComplete="off" maxLength={800} rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={zh ? "询问导师的研究、成果、报告、教学或课题组…" : "Ask about research, publications, talks, teaching, or the lab…"} />
            <button type="submit" disabled={loading || !question.trim()}>{loading ? (zh ? "回答中…" : "Answering…") : (zh ? "发送" : "Send")}</button>
          </div>
          <p>{zh ? "回答仅基于本站公开材料；本浏览器每天最多提问 8 次。" : "Answers use only public site content and state when evidence is insufficient. This browser may ask up to 8 questions per day."}</p>
        </form>
      </section>
    </div>
  );
}
