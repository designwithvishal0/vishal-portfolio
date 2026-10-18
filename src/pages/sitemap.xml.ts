// sitemap.xml for search engines: every public page, built from the page files so new pages join on their own.
// Drafts (/directions, /looks, /system) stay out, matching robots.txt. Pages like /work/graphics/[slug] expand through their own getStaticPaths.
import type { APIRoute } from 'astro';
const pages = import.meta.glob('./**/*.astro', { eager: true }) as Record<string, { getStaticPaths?: () => { params: Record<string, string> }[] }>;
export const GET: APIRoute = ({ site }) => {
  const paths = Object.entries(pages).flatMap(([f, mod]) => {
    const p = f.slice(1).replace(/index\.astro$/, '').replace(/\.astro$/, '/');
    if (!p.includes('[')) return [p];
    return (mod.getStaticPaths?.() ?? []).map(({ params }) => p.replace(/\[(\w+)\]/g, (_, k) => params[k]));
  }).filter((p) => !/^\/(directions|looks|system)\b/.test(p));
  const urls = paths.sort().map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
