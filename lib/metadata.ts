import type {Metadata} from "next";
import type {Language} from "./content";

const siteUrl = "https://yizhoufan.com";

export function localizedMetadata(lang: Language, path: string, titleEn: string, titleZh: string, descriptionEn: string, descriptionZh: string): Metadata {
  const title = lang === "zh" ? titleZh : titleEn;
  const description = lang === "zh" ? descriptionZh : descriptionEn;
  return {
    title,
    description,
    alternates: {canonical: `${siteUrl}/${lang}${path}`, languages: {en: `${siteUrl}/en${path}`, zh: `${siteUrl}/zh${path}`}},
    openGraph: {title: `${title} · Yizhou Fan`, description, url: `${siteUrl}/${lang}${path}`},
  };
}
