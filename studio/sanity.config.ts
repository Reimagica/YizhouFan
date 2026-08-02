import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./schemaTypes";
import {PublicationCreateTool} from "./tools/PublicationCreateTool";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) throw new Error("SANITY_STUDIO_PROJECT_ID is required");

export default defineConfig({
  name: "yizhou-fan",
  title: "范逸洲个人网站内容管理",
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [structureTool(), visionTool()],
  tools: [{name: "add-publication", title: "添加学术成果", component: PublicationCreateTool}],
  schema: {types: schemaTypes},
});
