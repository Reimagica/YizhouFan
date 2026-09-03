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
  plugins: [
    structureTool({
      structure: (S) => {
        const publicationItem = S.listItem()
          .id("publication")
          .title("学术成果")
          .schemaType("publication")
          .child(
            S.list()
              .id("publication-menu")
              .title("学术成果")
              .items([
                S.listItem()
                  .id("publication-list")
                  .title("全部学术成果")
                  .schemaType("publication")
                  .child(S.documentTypeList("publication").title("全部学术成果")),
                S.listItem()
                  .id("add-publication")
                  .title("添加学术成果")
                  .child(
                    S.component(PublicationCreateTool)
                      .id("add-publication-tool")
                      .title("添加学术成果"),
                  ),
              ]),
          );

        return S.list()
          .id("content")
          .title("内容")
          .items(
            S.documentTypeListItems().map((item) =>
              item.getId() === "publication" ? publicationItem : item,
            ),
          );
      },
    }),
    visionTool(),
  ],
  schema: {types: schemaTypes},
});
