import type { AcademicCandidate } from "../cms/types";

const USER_AGENT = "YizhouFanAcademicWebsite/0.1 (mailto:fyz@pku.edu.cn)";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
}

function normalized(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function similarity(left: string, right: string) {
  const a = new Set(normalized(left).split(" ").filter(Boolean));
  const b = new Set(normalized(right).split(" ").filter(Boolean));
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter((token) => b.has(token)).length;
  return (2 * overlap) / (a.size + b.size);
}

function score(queryTitle: string, candidateTitle: string, expectedDoi?: string, candidateDoi?: string) {
  const titleScore = similarity(queryTitle, candidateTitle);
  const doiMatch = expectedDoi && candidateDoi && normalized(expectedDoi) === normalized(candidateDoi) ? 1 : 0;
  return Math.min(1, titleScore * 0.8 + doiMatch * 0.2);
}

async function getJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Academic source returned ${response.status}`);
  return response.json() as Promise<T>;
}

async function searchCrossref(title: string, doi?: string): Promise<AcademicCandidate[]> {
  const url = doi
    ? new URL(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)
    : new URL("https://api.crossref.org/works");
  if (!doi) {
    url.searchParams.set("query.title", title);
    url.searchParams.set("rows", "5");
    url.searchParams.set("select", "DOI,title,author,published,container-title,URL,abstract");
  }
  type Item = { DOI?: string; title?: string[]; author?: Array<{ given?: string; family?: string }>; published?: { "date-parts"?: number[][] }; "container-title"?: string[]; URL?: string; abstract?: string };
  const payload = await getJson<{ message: Item | { items?: Item[] } }>(url);
  const listPayload = payload.message as {items?: Item[]};
  const items: Item[] = Array.isArray(listPayload.items) ? listPayload.items : [payload.message as Item];
  return items.map((item) => {
    const candidateTitle = cleanText(item.title?.[0]);
    return {
      source: "crossref",
      sourceId: item.DOI ?? item.URL ?? candidateTitle,
      confidence: score(title, candidateTitle, doi, item.DOI),
      title: candidateTitle,
      authors: (item.author ?? []).map((author) => [author.given, author.family].filter(Boolean).join(" ")),
      year: item.published?.["date-parts"]?.[0]?.[0],
      venue: cleanText(item["container-title"]?.[0]),
      doi: item.DOI,
      url: item.URL,
      abstract: cleanText(item.abstract),
    };
  });
}

async function searchOpenAlex(title: string, doi?: string): Promise<AcademicCandidate[]> {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", doi || title);
  url.searchParams.set("per-page", "5");
  url.searchParams.set("mailto", "fyz@pku.edu.cn");
  type Item = { id: string; display_name?: string; publication_year?: number; doi?: string; primary_location?: { source?: { display_name?: string }; landing_page_url?: string }; authorships?: Array<{ author?: { display_name?: string } }>; cited_by_count?: number };
  const payload = await getJson<{ results?: Item[] }>(url);
  return (payload.results ?? []).map((item) => {
    const candidateTitle = cleanText(item.display_name);
    const candidateDoi = item.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    return {
      source: "openalex",
      sourceId: item.id,
      confidence: score(title, candidateTitle, doi, candidateDoi),
      title: candidateTitle,
      authors: (item.authorships ?? []).map((entry) => cleanText(entry.author?.display_name)).filter(Boolean),
      year: item.publication_year,
      venue: cleanText(item.primary_location?.source?.display_name),
      doi: candidateDoi,
      url: item.primary_location?.landing_page_url ?? item.id,
      citationCount: item.cited_by_count,
    };
  });
}

async function searchSemanticScholar(title: string): Promise<AcademicCandidate[]> {
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", title);
  url.searchParams.set("limit", "5");
  url.searchParams.set("fields", "title,authors,year,venue,url,externalIds,abstract,citationCount");
  type Item = { paperId: string; title?: string; authors?: Array<{ name?: string }>; year?: number; venue?: string; url?: string; externalIds?: { DOI?: string }; abstract?: string; citationCount?: number };
  const payload = await getJson<{ data?: Item[] }>(url);
  return (payload.data ?? []).map((item) => {
    const candidateTitle = cleanText(item.title);
    return {
      source: "semantic-scholar",
      sourceId: item.paperId,
      confidence: score(title, candidateTitle),
      title: candidateTitle,
      authors: (item.authors ?? []).map((author) => cleanText(author.name)).filter(Boolean),
      year: item.year,
      venue: cleanText(item.venue),
      doi: item.externalIds?.DOI,
      url: item.url,
      abstract: cleanText(item.abstract),
      citationCount: item.citationCount,
    };
  });
}

async function searchDblp(title: string): Promise<AcademicCandidate[]> {
  const url = new URL("https://dblp.org/search/publ/api");
  url.searchParams.set("q", title);
  url.searchParams.set("h", "5");
  url.searchParams.set("format", "json");
  type Hit = { info?: { key?: string; title?: string; authors?: { author?: string | string[] | Array<{ text?: string }> }; year?: string; venue?: string; doi?: string; url?: string } };
  const payload = await getJson<{ result?: { hits?: { hit?: Hit[] } } }>(url);
  return (payload.result?.hits?.hit ?? []).map(({ info = {} }) => {
    const rawAuthors = info.authors?.author;
    const authorList = Array.isArray(rawAuthors) ? rawAuthors : rawAuthors ? [rawAuthors] : [];
    const candidateTitle = cleanText(info.title);
    return {
      source: "dblp",
      sourceId: info.key ?? info.url ?? candidateTitle,
      confidence: score(title, candidateTitle),
      title: candidateTitle,
      authors: authorList.map((author) => cleanText(typeof author === "string" ? author : author.text)).filter(Boolean),
      year: info.year ? Number(info.year) : undefined,
      venue: cleanText(info.venue),
      doi: info.doi,
      url: info.url,
    };
  });
}

export async function lookupAcademicWork(title: string, doi?: string) {
  const results = await Promise.allSettled([
    searchCrossref(title, doi),
    searchOpenAlex(title, doi),
    searchSemanticScholar(title),
    searchDblp(title),
  ]);
  const candidates = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const deduplicated = new Map<string, AcademicCandidate>();
  for (const candidate of candidates) {
    if (!candidate.title || candidate.confidence < 0.35) continue;
    const key = candidate.doi ? `doi:${normalized(candidate.doi)}` : `title:${normalized(candidate.title)}`;
    const current = deduplicated.get(key);
    if (!current || candidate.confidence > current.confidence) deduplicated.set(key, candidate);
  }
  return [...deduplicated.values()].sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}
