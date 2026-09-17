import type {MetadataRoute} from "next";
import {getTalks} from "../lib/cms/content";
import {siteUrl} from "../lib/metadata";

function localizedEntries(path: string): MetadataRoute.Sitemap {
  const englishUrl = `${siteUrl}/en${path}`;
  const chineseUrl = `${siteUrl}/zh${path}`;
  const languages = {en: englishUrl, zh: chineseUrl, "x-default": englishUrl};

  return [
    {url: englishUrl, alternates: {languages}},
    {url: chineseUrl, alternates: {languages}},
  ];
}

function hasIndexableDetail(talk: Awaited<ReturnType<typeof getTalks>>[number]) {
  const hasBody = Boolean(talk.body?.length || talk.bodyZh?.length);
  const hasSummary = Boolean(talk.summary?.trim() || talk.summaryZh?.trim());
  return !talk.attachments?.length && !talk.slidesUrl && (hasBody || hasSummary);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/publications", "/talks", "/teaching", "/people"];
  const entries: MetadataRoute.Sitemap = routes.flatMap(localizedEntries);
  const talks = await getTalks();
  for (const talk of talks.filter(hasIndexableDetail)) {
    entries.push(...localizedEntries(`/talks/${encodeURIComponent(talk.id)}`));
  }
  return entries;
}
