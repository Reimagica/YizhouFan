import type {ScholarMetrics} from "../cms/types";
import {parseScholarAuthorResponse, reviewReason, SCHOLAR_AUTHOR_ID, SCHOLAR_SOURCE_URL} from "./scholar-metrics";
import {patchPublishedSanityDocument, querySanityWithWriteAccess} from "./sanity-write";

type ProfileSnapshot = {_id: string; _rev: string; scholarMetrics?: ScholarMetrics};

export type ScholarSyncResult = {
  status: "updated" | "unchanged" | "review_required";
  metrics: ScholarMetrics;
  reason?: string;
};

async function fetchScholarMetrics(apiKey: string) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_scholar_author");
  url.searchParams.set("author_id", SCHOLAR_AUTHOR_ID);
  url.searchParams.set("hl", "en");
  url.searchParams.set("num", "1");
  url.searchParams.set("api_key", apiKey);
  const response = await fetch(url, {cache: "no-store", signal: AbortSignal.timeout(20_000)});
  if (!response.ok) throw new Error(`SerpApi request failed with ${response.status}`);
  return parseScholarAuthorResponse(await response.json());
}

export async function syncScholarMetrics(): Promise<ScholarSyncResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error("SerpApi is not configured");
  const profile = await querySanityWithWriteAccess<ProfileSnapshot | null>(
    `*[_type == "profile" && status == "published"][0]{_id, _rev, scholarMetrics}`,
  );
  if (!profile?._id) throw new Error("Published Sanity profile was not found");
  const received = await fetchScholarMetrics(apiKey);
  const now = new Date();
  const metrics: ScholarMetrics = {
    ...received,
    asOf: now.toISOString().slice(0, 10),
    syncedAt: now.toISOString(),
    sourceUrl: SCHOLAR_SOURCE_URL,
  };
  const reason = reviewReason(profile.scholarMetrics, received);
  if (reason) return {status: "review_required", metrics, reason};
  const current = profile.scholarMetrics;
  const unchanged = current
    && current.citations === metrics.citations
    && current.hIndex === metrics.hIndex
    && current.i10Index === metrics.i10Index
    && current.asOf === metrics.asOf;
  if (unchanged) return {status: "unchanged", metrics};
  await patchPublishedSanityDocument(profile._id, {scholarMetrics: metrics}, profile._rev);
  return {status: "updated", metrics};
}
