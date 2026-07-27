import { notFound } from "next/navigation";
import { SiteShell } from "../../components/SiteShell";
import { isLanguage } from "../../lib/content";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export default async function LanguageLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();

  return <SiteShell lang={lang}>{children}</SiteShell>;
}

