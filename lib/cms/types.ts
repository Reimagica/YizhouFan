export type PublicPublication = {
  id: string;
  year: number;
  kind: string;
  title: string;
  titleZh?: string;
  authors: string;
  venue: string;
  featured?: boolean;
  doi?: string;
  abstract?: string;
  abstractZh?: string;
  keywords?: string[];
  pdfUrl?: string;
  sourceUrl?: string;
  bibtex?: string;
};

export type PublicTalk = {
  id: string;
  date: string;
  type: string;
  title: string;
  titleZh?: string;
  host: string;
  hostZh?: string;
  summary?: string;
  summaryZh?: string;
  keywords?: string[];
  slidesUrl?: string;
  slidesFormat?: "pptx" | "pdf";
};

export type PublicPerson = {
  id: string;
  name: string;
  nameZh: string;
  status: string;
  statusZh: string;
  category: "postdoc" | "student" | "alumni";
  portraitUrl?: string;
};

export type PublicProfile = {
  name: string;
  role: string;
  affiliation: string;
  email: string;
  bio: string[];
  researchStatement: string;
  researchInterests: string[];
  appointments: Array<{year: string; institution: string; role: string}>;
  honors: Array<{year: string; title: string}>;
  publicProjects: Array<{year: string; title: string}>;
  courses: Array<{title: string; nature: string}>;
  academicService: string;
};

export type AcademicCandidate = {
  source: "crossref" | "openalex" | "semantic-scholar" | "dblp";
  sourceId: string;
  confidence: number;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  citationCount?: number;
};

export type TalkSummaryDraft = {
  summaryZh: string;
  summaryEn: string;
  keywordsZh: string[];
  keywordsEn: string[];
  outlineZh: string[];
  outlineEn: string[];
  warnings: string[];
};
