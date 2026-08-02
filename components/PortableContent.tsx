import type {ReactNode} from "react";
import type {Language} from "../lib/content";
import type {PortableBlock, PortableMarkDef} from "../lib/cms/types";

function safeUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function PortableContent({blocks, lang}: {blocks?: PortableBlock[]; lang: Language}) {
  if (!blocks?.length) return null;
  const zh = lang === "zh";
  const footnotes = new Map<string, {number: number; text: string}>();
  for (const block of blocks) {
    for (const mark of block.markDefs ?? []) {
      if (mark._type === "footnote" && mark.text && !footnotes.has(mark._key)) footnotes.set(mark._key, {number: footnotes.size + 1, text: mark.text});
    }
  }

  function marked(content: ReactNode, marks: string[], definitions: PortableMarkDef[]) {
    return marks.reduce<ReactNode>((node, markKey) => {
      if (markKey === "strong") return <strong>{node}</strong>;
      if (markKey === "em") return <em>{node}</em>;
      const definition = definitions.find((item) => item._key === markKey);
      if (definition?._type === "externalLink") {
        const href = safeUrl(definition.href);
        return href ? <a href={href} target={definition.newTab === false ? undefined : "_blank"} rel="noreferrer">{node}</a> : node;
      }
      if (definition?._type === "footnote") {
        const footnote = footnotes.get(definition._key);
        return footnote ? <>{node}<sup><a href={`#footnote-${footnote.number}`} aria-label={`${zh ? "脚注" : "Footnote"} ${footnote.number}`}>{footnote.number}</a></sup></> : node;
      }
      return node;
    }, content);
  }

  return <div className="portable-content">
    {blocks.map((block) => {
      if (block._type === "reportImage" && block.imageUrl) {
        const sourceUrl = safeUrl(block.sourceUrl);
        return <figure key={block._key}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.imageUrl} alt={(zh ? block.alt?.zh : block.alt?.en) ?? block.alt?.zh ?? block.alt?.en ?? ""} />
          <figcaption>{zh ? block.caption?.zh : block.caption?.en}{block.credit && <> · {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer">{block.credit}</a> : block.credit}</>}</figcaption>
        </figure>;
      }
      if (block._type === "reportNote") return <aside className="report-note" key={block._key}>{block.title && <strong>{block.title}</strong>}<p>{block.text}</p></aside>;
      const children = (block.children ?? []).map((span) => <span key={span._key}>{marked(span.text, span.marks ?? [], block.markDefs ?? [])}</span>);
      if (block.style === "h2") return <h2 key={block._key}>{children}</h2>;
      if (block.style === "h3") return <h3 key={block._key}>{children}</h3>;
      if (block.style === "blockquote") return <blockquote key={block._key}>{children}</blockquote>;
      return <p key={block._key}>{children}</p>;
    })}
    {footnotes.size > 0 && <section className="report-footnotes"><h2>{zh ? "注释" : "Notes"}</h2><ol>{[...footnotes.values()].map((item) => <li id={`footnote-${item.number}`} key={item.number}>{item.text}</li>)}</ol></section>}
  </div>;
}
