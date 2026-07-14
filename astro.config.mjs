import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;
const site =
  process.env.PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  vercelProductionUrl ||
  "https://aurolab-rosy.vercel.app";

export default defineConfig({
  site,
  trailingSlash: "always",
  build: {
    inlineStylesheets: "always",
  },
  integrations: [react()],
});
