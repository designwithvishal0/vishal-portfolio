# Framer SEO carry over

Pulled from the live site https://designwvishal.framer.website on 8 October 2026 (read only, nothing on the live site was changed). Source: each page's own HTML head, plus sitemap.xml and robots.txt.

## 1. What the Framer site has today

### Per page metadata

All six pages in the sitemap have a unique title, description, share image and a self canonical. The og and twitter titles and descriptions match the page title and description exactly.

| Old URL | Title (length) | Description (length) | Share image (og and twitter) |
|---|---|---|---|
| `/` | Vishal Yadav \| Product (UI/UX) Designer (39) | Vishal Yadav, Product (UI/UX) Designer in India. I design B2C and B2B products that drive retention, conversion and growth. Open to full time roles and freelance projects. (171) | https://framerusercontent.com/images/I4AylelyiqWSYl06Drwj1WE.png |
| `/work/ixigo-trains` | ixigo Trains · The four hours nobody designs for \| Vishal Yadav (63) | A post booking redesign of ixigo Trains, covering the four hours before departure when a chart decides whether you travel at all. (129) | https://framerusercontent.com/assets/koB2fjrEzJwcseu22ei43G30SI.png |
| `/work/split-and-request` | Google Pay Split and Request · The split that stays alive \| Vishal Yadav (72) | A Google Pay redesign where a bill split stays alive after you send it: a board everyone sees, good news when someone pays, a memory once it settles and a recap a month later. (175) | https://framerusercontent.com/assets/03MLV3GMBauxY73EVqvnN26E0Sc.png |
| `/work/twelve` | Twelve · An AI finance app that plans on a twelve month horizon \| Vishal Yadav (78) | A self initiated AI product design concept: a finance app that plans across the next twelve months and answers one question every day: am I okay? (145) | https://framerusercontent.com/assets/3lexceZwPVVHF8fV0Zv7QMZCI.png |
| `/work/staqu-jarvis` | Staqu JARVIS Alerts · Making every correction visible \| Vishal Yadav (68) | A false alert flow for Staqu's AI CCTV platform that makes every correction visible, so the people woken up at 3 AM can see the system learning. (144) | https://framerusercontent.com/assets/LcvPY6k6LxQU60K2x3tVDpZ8.png |
| `/work/onebanc` | OneBanc · A salary account app that thinks in months \| Vishal Yadav (67) | A self initiated concept for OneBanc. Three screens and a design system built around the salary cycle and a card with no number on it. (134) | https://framerusercontent.com/assets/RmiKjidRY5jTlK0lBPzJTAz0.png |

Favicon (light and dark, also apple touch icon): https://framerusercontent.com/images/CwSz7YdQInjU3kLIbs2be8HdpI4.png

### Site wide

| Item | Today |
|---|---|
| twitter:card | summary_large_image on every page |
| og:type | website on every page, case studies included |
| robots meta | max-image-preview:large |
| Canonical | self canonical on every page, pointing at the framer.website URL |
| Google Search Console | verified by meta tag `google-site-verification=qSwZvL_k7SUZWOOEE_Lky3I2ygyGBfKwik4EwLHaFmg` |
| sitemap.xml | the 6 URLs above, no lastmod |
| robots.txt | allow all, points at the sitemap |
| Structured data | none (no JSON LD on any page checked) |
| H1, home | "I design products that drive retention." (rotating last word, no name in it) |
| H1, ixigo | "The four hours nobody designs for" (headline only, no project name) |
| hreflang | none |

### Two things in 01-ANALYSIS.md are now out of date

1. JARVIS no longer carries Twelve's title, description and image. It has its own (row above).
2. The `/en/` duplicate is gone: `/en/work/staqu-jarvis` now returns 404 with noindex. Nothing to redirect there.

## 2. Carry over checklist for the new site

Keep means copy the value as is. Improve means the new value replaces the old one. Tick each item when it is verified on the preview URL, not when the code is written.

| # | Item | Action | New site target |
|---|---|---|---|
| ☐ 1 | Home title | Improve | Lead with the exact query: "Vishal Yadav, Product Designer" plus a short positioning phrase, under 60 characters. Drop "(UI/UX)" from the title; keep "UI/UX" in the description so that search still matches. |
| ☐ 2 | Home description | Improve | Keep the substance (name, product designer, India, B2C and B2B, open to full time and freelance). Trim to about 155 characters; today's 171 gets cut off in results. Add one concrete proof point once the shipped Profit Wala Love numbers are approved. |
| ☐ 3 | Case study titles | Keep the pattern | "Project · Headline \| Vishal Yadav" works well. Keep ixigo, JARVIS and OneBanc as they are. Shorten Split (72) and Twelve (78) to 60 to 65 so the name is not truncated. |
| ☐ 4 | Case study descriptions | Keep | All between 129 and 175 characters and specific. Only trim Split (175) to about 155. |
| ☐ 5 | Share images | Keep, then rehost | Download all six PNGs above and the favicon before Framer is unpublished, since they live on Framer's CDN. Check each is 1200 by 630. Then switch to generated per page images at build time as CLAUDE.md asks; the downloaded ones are the fallback and the visual reference. Also check `~/Pictures/portfolio-social-share.png` against the home one and use whichever is newer. |
| ☐ 6 | Share images for new pages | Add | /about, /work-with-me, /pages-that-sell, /archive, /work/profit-wala-love each need their own image, title and description. None exist today. |
| ☐ 7 | og:type | Improve | `website` on home, `article` on every case study. |
| ☐ 8 | twitter:card and robots max-image-preview:large | Keep | Same on every page. |
| ☐ 9 | Canonical | Keep the habit, new domain | Self canonical on every page, absolute URL on the new domain, no trailing slash mismatch with the sitemap. |
| ☐ 10 | H1 | Improve | Home H1 contains his name and "product designer" in real text, no rotating word. Each case study H1 names the project and the headline, for example "ixigo Trains: The four hours nobody designs for". |
| ☐ 11 | Structured data | Add | Person on home (name, jobTitle, url, image, sameAs: LinkedIn, Behance design_vishaly, X, Instagram vishal.y0109), CreativeWork or Article per case study with author Person, BreadcrumbList on inner pages. Validate in Google's Rich Results Test. |
| ☐ 12 | sitemap.xml and robots.txt | Keep, improve | Generate both. Sitemap lists every page on the new domain with lastmod. |
| ☐ 13 | Search Console | Redo for the new domain | Add the new domain as a Domain property (DNS TXT record), submit the sitemap. Keep the old framer.website property: it is needed for the move in section 3. |
| ☐ 14 | Favicon and apple touch icon | Keep, rehost | Download the PNG above or make a fresh one; serve from the new domain. |
| ☐ 15 | Slugs | Keep | Use the same paths on the new site (`/work/ixigo-trains`, `/work/split-and-request`, `/work/twelve`, `/work/staqu-jarvis`, `/work/onebanc` if kept). Same paths make every redirect a one to one swap of the domain and keep any links people already shared working. |

## 3. Redirects from the old Framer URLs

| Old URL on designwvishal.framer.website | New URL | Note |
|---|---|---|
| `/` | `/` | |
| `/work/ixigo-trains` | `/work/ixigo-trains` | |
| `/work/split-and-request` | `/work/split-and-request` | |
| `/work/twelve` | `/work/twelve` | |
| `/work/staqu-jarvis` | `/work/staqu-jarvis` | Keep this slug even if the page is renamed "JARVIS Alerts". |
| `/work/onebanc` | `/work/onebanc`, or `/archive` if OneBanc is cut | Depends on decision 6 in 00-START-HERE.md. |
| `/#about-me` | `/about` | A fragment never reaches a server, so this cannot be a real redirect. Just make sure every link that used to point here points at /about. |
| Resume on Google Drive (`drive.google.com/file/d/1jmRPxgEQho0DAgOUZfCbfY0H3PXGPnkX`) | `/resume` | Not a redirect; update every place that shares the Drive link once the new PDF is confirmed. |

How the move happens, in order:

1. Launch the new site with the same slugs and everything in section 2 passing.
2. On the Framer project, add a redirect for each row above to the new domain with a permanent (301) status, if the plan allows external redirects in Site Settings. I could not check this from outside the editor, so confirm it in Framer before relying on it.
3. If Framer cannot do it, keep the Framer site live and point each Framer page's canonical at its new URL instead, with a visible "This portfolio has moved" link. Weaker than a 301, but Google still follows it.
4. In the old framer.website Search Console property, run Change of Address to the new domain (this only works with real 301s from step 2).
5. Update LinkedIn, Behance, X, Instagram, CV and email signature to the new domain.
6. Leave Framer up for at least a few weeks after Google shows the new URLs for "Vishal Yadav product designer", then unpublish. Unpublishing kills the redirects too.

## 4. Outbound links found on the Framer pages

For reference when the new pages are built. Every case study page also links to its Figma file or prototype; those need the logged out test from 03-CONTENT-INVENTORY.md before reuse.

Home links out to Behance for Reward Centre, Beauty PDP, Basil, Big Birthday Bash and CosIQ, and to Dribbble for Valentines Day landing page, Food Delivery App, Home Products App, Gaming Leaderboard, Sportify dashboard, Fashionista homepage and Gaming Dashboard. Note that the Dribbble links are under `dribbble.com/shots/...`; 03-CONTENT-INVENTORY.md lists `dribbble.com/VISHAL-YADAV` as not his, so confirm these shots are his before linking them from the new site.
