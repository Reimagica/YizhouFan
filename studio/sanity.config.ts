import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./schemaTypes";
import {ApplyPublicationCandidateAction, RequestAutomationAction} from "./actions/automationActions";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) throw new Error("SANITY_STUDIO_PROJECT_ID is required");

export default defineConfig({
  name: "yizhou-fan",
  title: "范逸洲个人网站内容管理",
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [structureTool(), visionTool()],
  schema: {types: schemaTypes},
  document: {
    actions: (previous, context) => {
      if (context.schemaType === "publication") return [RequestAutomationAction, ApplyPublicationCandidateAction, ...previous];
      if (context.schemaType === "talk") return [RequestAutomationAction, ...previous];
      return previous;
    },
  },
});
