import { content, type Language } from "./content";
import {getPeople, getProfile, getPublications, getTalks} from "./cms/content";

export type PublicSource = { label: string; url: string };

export const publicSources: PublicSource[] = [
  { label: "Personal profile", url: "/en" },
  { label: "Publications", url: "/en/publications" },
  { label: "Talks", url: "/en/talks" },
  { label: "People", url: "/en/people" },
  { label: "Peking University faculty profile", url: "https://english.gse.pku.edu.cn/faculty/technology/1062jyxyyw164100.htm" },
  { label: "Google Scholar", url: "https://scholar.google.com/citations?user=EBZdbGwAAAAJ&hl=en" },
];

export async function buildPublicKnowledge(lang: Language) {
  const copy = content[lang];
  const [profile, publications, talks, people] = await Promise.all([
    getProfile(lang),
    getPublications(),
    getTalks(),
    getPeople(),
  ]);
  const publicationText = publications.map((item) => `${item.year}; ${item.kind}; ${item.title}; ${item.authors}; ${item.venue}`).join("\n");
  const talkText = talks.map((item) => `${item.date}; ${item.type}; ${item.title}; ${item.host}`).join("\n");
  const peopleText = people.map((item) => `${item.name} / ${item.nameZh}; ${item.status} / ${item.statusZh}; ${item.category}`).join("\n");
  const honorsText = profile.honors.map((item) => `${item.year}; ${item.title}`).join("\n");
  const projectsText = profile.publicProjects.map((item) => `${item.year}; ${item.title}`).join("\n");
  const courseText = profile.courses.map((item) => `${item.title}; ${item.nature}`).join("\n");

  return `
PUBLIC PROFILE
Name: Yizhou Fan / 范逸洲
Position: ${profile.role}; ${profile.affiliation}.
Public email: ${profile.email}
Research: ${profile.researchInterests.join(", ")}.
Research statement: ${profile.researchStatement || copy.heroBody}

TEACHING
${courseText}

HONORS AND AWARDS
${honorsText}

RESEARCH PROJECTS
${projectsText}

LAB OVERVIEW
FanLearn Lab is a research group led by Yizhou Fan. Its research focus includes AI for Education, learning analytics, intelligent tutoring systems, large language models, metacognition, and self-regulated learning.

PUBLICATIONS
${publicationText}

TALKS
${talkText}

PEOPLE
${peopleText}
`.trim();
}
