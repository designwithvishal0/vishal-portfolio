import { defineConfig } from 'astro/config';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Case study pages keep their <style> blocks next to the markup they style. Browsers can paint the page before a
// style block further down has been read, so the hero, facts and reel jump into place a moment later (layout shift,
// up to 1.1 CLS on Profit Wala Love). After the build, every body <style> moves to the end of <head>, in the same
// order, so the cascade is unchanged and the first paint is already the final layout.
const hoistStyles = {
  name: 'hoist-body-styles',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; });
      for (const file of walk(fileURLToPath(dir))) {
        // Split's phone Read more script measures paragraphs before its later styles load; hoisting would fold seven more of them on an approved page
        if (file.includes('split-and-request')) continue;
        const html = readFileSync(file, 'utf8'), h = html.indexOf('</head>');
        if (h < 0) continue;
        let body = html.slice(h), moved = '';
        body = body.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, (m, at) => {
          const before = body.slice(0, at);
          if ((before.match(/<svg\b/g) || []).length > (before.match(/<\/svg>/g) || []).length) return m; // leave SVG styles alone
          moved += m; return '';
        });
        if (moved) writeFileSync(file, html.slice(0, h) + moved + body);
      }
    },
  },
};

// ponytail: placeholder site URL until the domain is chosen; swap it then.
export default defineConfig({
  site: 'https://vishal-designs.vercel.app',
  integrations: [hoistStyles],
});
