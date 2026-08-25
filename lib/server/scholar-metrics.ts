import type {ScholarMetrics} from "../cms/types";

export const SCHOLAR_AUTHOR_ID = "EBZdbGwAAAAJ";
export const SCHOLAR_SOURCE_URL = `https://scholar.google.com/citations?user=${SCHOLAR_AUTHOR_ID}&hl=en`;

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : undefined;
}

function allValue(row: unknown, aliases: string[]) {
  const rowRecord = record(row);
  if (!rowRecord) return undefined;
  for (const alias of aliases) {
    const metric = record(rowRecord[alias]);
    if (metric && Number.isSafeInteger(metric.all) && Number(metric.all) >= 0) return Number(metric.all);
  }
  return undefined;
}

export function parseScholarAuthorResponse(payload: unknown) {
  const root = record(payload);
  const metadata = record(root?.search_metadata);
  if (!root || metadata?.status !== "Success") {
    throw new Error("SerpApi did not return a successful Scholar response");
  }
  const parameters = record(root.search_parameters);
  if (parameters?.author_id !== SCHOLAR_AUTHOR_ID) {
    throw new Error("SerpApi returned a different Scholar author");
  }
  const citedBy = record(root.cited_by);
  const table = Array.isArray(citedBy?.table) ? citedBy.table : [];
  const citations = allValue(table[0], ["citations"]);
  const hIndex = allValue(table[1], ["h_index", "h-index", "indice_h"]);
  const i10Index = allValue(table[2], ["i10_index", "i10-index", "indice_i10"]);
  if (citations === undefined || hIndex === undefined || i10Index === undefined) {
    throw new Error("SerpApi Scholar metrics are incomplete");
  }
  return {citations, hIndex, i10Index};
}

export function reviewReason(current: ScholarMetrics | undefined, next: ReturnType<typeof parseScholarAuthorResponse>) {
  if (!current) return undefined;
  const citationLimit = Math.max(250, Math.ceil(current.citations * 0.1));
  if (Math.abs(next.citations - current.citations) > citationLimit) return "citation_change_exceeds_limit";
  if (Math.abs(next.hIndex - current.hIndex) > 5) return "h_index_change_exceeds_limit";
  if (Math.abs(next.i10Index - current.i10Index) > 10) return "i10_index_change_exceeds_limit";
  return undefined;
}
