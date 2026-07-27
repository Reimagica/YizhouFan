import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yizhoufan.com"),
  title: {
    default: "Yizhou Fan · Learning, Humans, and AI",
    template: "%s · Yizhou Fan",
  },
  description:
    "Academic website of Yizhou Fan, Assistant Professor and Research Fellow at Peking University.",
  keywords: [
    "Yizhou Fan",
    "范逸洲",
    "AI in Education",
    "Learning Analytics",
    "Self-regulated Learning",
    "Peking University",
  ],
  openGraph: {
    type: "website",
    title: "Yizhou Fan · Learning, Humans, and AI",
    description:
      "Research on metacognition, self-regulated learning, learning analytics, and human-AI collaboration.",
    images: [
      {
        url: "/og.png",
        width: 1728,
        height: 910,
        alt: "Yizhou Fan - Learning, humans, and AI.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yizhou Fan · Learning, Humans, and AI",
    description:
      "Research on metacognition, self-regulated learning, learning analytics, and human-AI collaboration.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fbf9f4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
