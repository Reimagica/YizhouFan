import type {Language} from "./content";
import {getCourses, getPeople, getProfile, getPublications, getTalks} from "./cms/content";
import {buildPublicKnowledgeText} from "./server/knowledge-retrieval";

export async function buildPublicKnowledgeBundle(lang: Language, question: string) {
  const [profile, publications, talks, people, courses] = await Promise.all([
    getProfile(lang),
    getPublications(),
    getTalks(),
    getPeople(),
    getCourses(),
  ]);
  return {
    text: buildPublicKnowledgeText({lang, question, profile, publications, talks, people, courses}),
    publications,
  };
}
