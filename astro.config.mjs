import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  build: {
    assetsPrefix: ".",
  },
  integrations: [react()],
});
