import type {Metadata} from "next";
import type {Language} from "./content";

export const siteUrl = "https://yizhoufan.com";

type LocalizedMetadataOptions = {
  index?: boolean;
};

export function localizedMetadata(
  lang: Language,
  path: string,
  titleEn: string,
  titleZh: string,
  descriptionEn: string,
  descriptionZh: string,
  options: LocalizedMetadataOptions = {},
): Metadata {
  const title = lang === "zh" ? titleZh : titleEn;
  const description = lang === "zh" ? descriptionZh : descriptionEn;
  const url = `${siteUrl}/${lang}${path}`;
  const englishUrl = `${siteUrl}/en${path}`;
  const chineseUrl = `${siteUrl}/zh${path}`;
  return {
    title: {absolute: title},
    description,
    alternates: {
      canonical: url,
      languages: {en: englishUrl, zh: chineseUrl, "x-default": englishUrl},
    },
    openGraph: {
      type: "website",
      siteName: "Yizhou Fan",
      title,
      description,
      url,
      locale: lang === "zh" ? "zh_CN" : "en_US",
      alternateLocale: lang === "zh" ? ["en_US"] : ["zh_CN"],
      images: [{url: `${siteUrl}/og.png`, width: 1728, height: 910, alt: lang === "zh" ? "范逸洲个人学术主页" : "Yizhou Fan academic website"}],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og.png`],
    },
    ...(options.index === false ? {
      robots: {
        index: false,
        follow: true,
        googleBot: {index: false, follow: true},
      },
    } : {}),
  };
}
