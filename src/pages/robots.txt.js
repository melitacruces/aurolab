import { SITE } from "../lib/seo.js";

export const prerender = true;

export function GET({ site }) {
  const siteOrigin = site || new URL(SITE.defaultOrigin);
  const sitemapUrl = new URL("/sitemap.xml", siteOrigin);

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
