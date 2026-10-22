import { defineConfig } from 'astro/config';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Case study pages keep their <style> blocks next to the markup they style. Browsers can paint the page before a
// style block further down has been read, so the layout can shift once it arrives. After the build, every body
// <style> moves to the end of <head>, in the same order, so the cascade is unchanged.
//
// Small local stylesheets under /css (shared case study CSS and the self hosted font faces) are also inlined, so the
// first paint does not wait on extra requests. Checked: none of these files use relative url() paths, so inlining
// keeps every font and image URL valid.
const hoistStyles = {
  name: 'hoist-body-styles',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; });
      for (const file of walk(root)) {
        let html = readFileSync(file, 'utf8');
        html = html.replace(/<link rel="stylesheet" href="\/css\/([\w\/-]+\.css)">/g, (m, f) => {
          try { return `<style>${readFileSync(join(root, 'css', f), 'utf8')}</style>`; } catch { return m; }
        });
        const h = html.indexOf('</head>');
        if (h < 0) { writeFileSync(file, html); continue; }
        // Split is left as it was: its styles are not hoisted (existing behaviour, kept on purpose)
        if (file.includes('split-and-request')) { writeFileSync(file, html); continue; }
        let body = html.slice(h), moved = '';
        body = body.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, (m, at) => {
          const before = body.slice(0, at);
          if ((before.match(/<svg\b/g) || []).length > (before.match(/<\/svg>/g) || []).length) return m; // leave SVG styles alone
          moved += m; return '';
        });
        writeFileSync(file, html.slice(0, h) + moved + body);
      }
    },
  },
};

// ponytail: placeholder site URL until the domain is chosen; swap it then.
export default defineConfig({
  site: 'https://vishal-designs.vercel.app',
  integrations: [hoistStyles],
  build: { inlineStylesheets: 'always' }, // small Astro CSS goes inline too, no render blocking request
});
