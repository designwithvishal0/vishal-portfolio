// Plain text map of the site for AI tools (llms.txt), built from the same data as the home page so it never drifts.
import type { APIRoute } from 'astro';
import { intro, work, results, lead, more, pages, email, social } from '../data/home';

export const GET: APIRoute = ({ site }) => {
  const url = (p: string) => new URL(p, site).href;
  const txt = `# Vishal Yadav, product designer

> ${intro.supporting} ${intro.availability}.

## Results at CashKaro (India's largest cashback platform, 25M+ users)

${results.map(r => `- ${r.n} ${r.label}`).join('\n')}

## Case studies

${work.map(w => `- [${w.name}: ${w.headline}](${url(`/work/${w.slug}/`)}): ${w.problem} ${w.type}, ${w.year}. ${w.role}. ${w.detail}.`).join('\n')}

## Shipped and other work

- [${lead.name}](${url(lead.href)}): ${lead.tag}. ${lead.line} ${lead.stats.map(([n, l]) => `${n} ${l}`).join(', ')}.
${[...more, ...pages].map(p => `- [${p.name}](${url(p.href)}): ${'tag' in p ? `${p.tag}. ` : ''}${p.line}`).join('\n')}

## Contact

- Email: ${email}
- [Book a call](${intro.links.find(l => l.label === 'Book a call')!.href})
- [Resume](${url('/Vishal_Yadav_Resume.pdf')})
${social.map(([l, h]) => `- [${l}](${h})`).join('\n')}
`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
