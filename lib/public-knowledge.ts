import { content, type Language } from "./content";
import {getPeople, getProfile, getPublications, getTalks} from "./cms/content";

export async function buildPublicKnowledgeBundle(lang: Language) {
  const copy = content[lang];
  const [profile, publications, talks, people] = await Promise.all([
    getProfile(lang),
    getPublications(),
    getTalks(),
    getPeople(),
  ]);
  const publicationText = publications.map((item) => `ID=${item.id}; ${item.year}; ${item.kind}; ${item.title}; ${item.titleZh ?? ""}; ${item.authors}; ${item.venue}`).join("\n");
  const talkText = talks.map((item) => `${item.date}; ${item.type}; ${item.title}; ${item.titleZh ?? ""}; ${item.host}; ${item.hostZh ?? ""}`).join("\n");
  const peopleText = people.map((item) => `${item.name} / ${item.nameZh}; ${item.status} / ${item.statusZh}; ${item.category}`).join("\n");
  const honorsText = profile.honors.map((item) => `${item.year}; ${item.title}`).join("\n");
  const projectsText = profile.publicProjects.map((item) => `${item.year}; ${item.title}`).join("\n");
  const courseText = profile.courses.map((item) => `${item.title}; ${item.nature}`).join("\n");

  const text = `
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
  return {text, publications};
}
