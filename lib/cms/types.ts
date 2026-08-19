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
  language?: "en" | "zh";
  volume?: string;
  issue?: string;
  pages?: string;
  articleNumber?: string;
};

export type PublicTalk = {
  id: string;
  date: string;
  displayOrder?: number;
  title: string;
  titleZh?: string;
  host: string;
  hostZh?: string;
  summary?: string;
  summaryZh?: string;
  keywords?: string[];
  slidesUrl?: string;
  slidesFormat?: "pptx" | "pdf";
  body?: PortableBlock[];
  bodyZh?: PortableBlock[];
  attachments?: Array<{
    label?: string;
    labelZh?: string;
    note?: string;
    noteZh?: string;
    url: string;
    mimeType?: string;
  }>;
};

export type PortableSpan = {_type: "span"; _key: string; text: string; marks?: string[]};
export type PortableMarkDef = {_key: string; _type: "externalLink" | "footnote"; href?: string; newTab?: boolean; text?: string};
export type PortableBlock = {
  _type: "block" | "reportImage" | "reportNote";
  _key: string;
  style?: "normal" | "h2" | "h3" | "blockquote";
  children?: PortableSpan[];
  markDefs?: PortableMarkDef[];
  imageUrl?: string;
  alt?: {en?: string; zh?: string};
  caption?: {en?: string; zh?: string};
  credit?: string;
  sourceUrl?: string;
  title?: string;
  text?: string;
};

export type PublicPerson = {
  id: string;
  name: string;
  nameZh: string;
  position?: string;
  positionZh?: string;
  enrollmentYear?: number;
  bio?: string;
  bioZh?: string;
  portraitUrl?: string;
  order?: number;
  profileUrl?: string;
  publicEmail?: string;
};

export type PublicCourse = {
  id: string;
  title: string;
  titleZh: string;
  nature: string;
  natureZh: string;
  description: string;
  descriptionZh: string;
  role?: string;
  roleZh?: string;
  offeredSince?: string;
  mooc?: boolean;
  moocUrl?: string;
  order: number;
};

export type ScholarMetrics = {
  citations: number;
  hIndex: number;
  i10Index: number;
  asOf: string;
  sourceUrl: string;
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
  scholarMetrics?: ScholarMetrics;
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
  kind?: string;
  matchedFields?: string[];
  missingFields?: string[];
  warnings?: string[];
};
