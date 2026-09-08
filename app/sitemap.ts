import type {MetadataRoute} from "next";
import {getTalks} from "../lib/cms/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes = ["", "/publications", "/talks", "/teaching", "/people", "/ask"];
  const entries: MetadataRoute.Sitemap = routes.flatMap((path) => [
    {url: `https://yizhoufan.com/en${path}`, lastModified: now, alternates: {languages: {zh: `https://yizhoufan.com/zh${path}`}}},
    {url: `https://yizhoufan.com/zh${path}`, lastModified: now, alternates: {languages: {en: `https://yizhoufan.com/en${path}`}}},
  ]);
  const talks = await getTalks();
  for (const talk of talks) {
    entries.push({url: `https://yizhoufan.com/en/talks/${talk.id}`, lastModified: now, alternates: {languages: {en: `https://yizhoufan.com/en/talks/${talk.id}`, zh: `https://yizhoufan.com/zh/talks/${talk.id}`}}});
    entries.push({url: `https://yizhoufan.com/zh/talks/${talk.id}`, lastModified: now, alternates: {languages: {en: `https://yizhoufan.com/en/talks/${talk.id}`, zh: `https://yizhoufan.com/zh/talks/${talk.id}`}}});
  }
  return entries;
}
