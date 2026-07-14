import { INDEXABLE_ROUTES, SITE } from "../lib/seo.js";

export const prerender = true;

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (character) => {
    const entities = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" };
    return entities[character];
  });
}

export function GET({ site }) {
  const siteOrigin = site || new URL(SITE.defaultOrigin);
  const urls = INDEXABLE_ROUTES.map(
    (route) => `  <url>\n    <loc>${escapeXml(new URL(route.path, siteOrigin).href)}</loc>\n  </url>`,
  ).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
