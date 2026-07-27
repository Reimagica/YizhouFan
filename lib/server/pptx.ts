import JSZip from "jszip";

const MAX_EXTRACTED_CHARS = 80_000;

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function textNodes(xml: string) {
  return [...xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)]
    .map((match) => decodeXml(match[1]).replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function numericOrder(name: string) {
  return Number(name.match(/(\d+)\.xml$/)?.[1] ?? 0);
}

export async function extractPptxText(bytes: ArrayBuffer) {
  const zip = await JSZip.loadAsync(bytes);
  const slides = Object.values(zip.files)
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry.name))
    .sort((a, b) => numericOrder(a.name) - numericOrder(b.name));
  if (!slides.length) throw new Error("The PPTX contains no readable slides");

  const sections: string[] = [];
  for (const [index, slide] of slides.entries()) {
    const xml = await slide.async("text");
    const text = textNodes(xml).join("\n");
    if (text) sections.push(`[Slide ${index + 1}]\n${text}`);
    if (sections.join("\n\n").length >= MAX_EXTRACTED_CHARS) break;
  }
  return sections.join("\n\n").slice(0, MAX_EXTRACTED_CHARS);
}
