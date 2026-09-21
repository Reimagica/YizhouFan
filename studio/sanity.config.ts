import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./schemaTypes";
import {PublicationCreateTool} from "./tools/PublicationCreateTool";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) throw new Error("SANITY_STUDIO_PROJECT_ID is required");

const personCategories = [
  {value: "postdoc", title: "博士后", legacyRoles: ["postdoc"]},
  {value: "phd", title: "博士研究生", legacyRoles: ["phd", "masterToPhd"]},
  {value: "master", title: "硕士研究生", legacyRoles: ["master"]},
  {value: "visiting", title: "访问学者", legacyRoles: ["other"]},
  {value: "alumni", title: "毕业生", legacyRoles: ["graduated"]},
] as const;

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

        const peopleItem = S.listItem()
          .id("person")
          .title("团队成员")
          .schemaType("person")
          .child(
            S.list()
              .id("person-categories")
              .title("团队成员")
              .items(personCategories.map((category) =>
                S.listItem()
                  .id(`person-${category.value}`)
                  .title(category.title)
                  .schemaType("person")
                  .child(
                    S.documentList()
                      .id(`person-${category.value}-list`)
                      .title(category.title)
                      .schemaType("person")
                      .filter('_type == "person" && (memberCategory == $category || (!defined(memberCategory) && memberRole in $legacyRoles))')
                      .params({category: category.value, legacyRoles: [...category.legacyRoles]})
                      .initialValueTemplates([
                        S.initialValueTemplateItem(`person-${category.value}`),
                      ]),
                  ),
              )),
          );

        return S.list()
          .id("content")
          .title("内容")
          .items(
            S.documentTypeListItems().map((item) =>
              item.getId() === "publication"
                ? publicationItem
                : item.getId() === "person"
                  ? peopleItem
                  : item,
            ),
          );
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter((template) => template.schemaType !== "person"),
      ...personCategories.map((category) => ({
        id: `person-${category.value}`,
        title: `添加${category.title}`,
        schemaType: "person",
        value: {memberCategory: category.value},
      })),
    ],
  },
});
