import {defineCliConfig} from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "missing-project-id",
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
  studioHost: process.env.SANITY_STUDIO_HOSTNAME ?? "yizhoufan",
  deployment: {
    appId: "z8bida90uxv4ghf7fifizdn0",
  },
});
