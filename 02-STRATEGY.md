# Strategy and plan

## 1. Positioning (decide this before any pixel)

The site needs one sentence that only Vishal could write. His work already has a thread running through it: he designs for the moment a person is unsure and about to drop off. The waitlisted passenger four hours before the chart. The friend who has not paid back yet. The guard woken at 3 AM by a false alert. The shopper who cannot tell if a shade will match. The salaried person asking "am I okay this month".

Three directions to test with Vishal (Claude Code writes 3 more and then he picks one):

1. "I design for the moment people are about to give up." (thread of uncertainty and drop off)
2. "Product designer who starts where users drop off." (closest to his LinkedIn line, safest)
3. "I design the screens people open when something might go wrong." (sharper, more memorable)

Supporting line underneath states the facts plainly: product designer in Gurugram, commerce and fintech, apps, product pages and landing pages, available for full time roles and freelance.

## 2. Who the site serves and what each needs

| Audience | Time they give | What they need to see | Where they go |
|---|---|---|---|
| Design hiring manager | 2 to 5 minutes | Thinking, decisions, tradeoffs, role, craft | 1 or 2 case studies, then resume |
| Recruiter | 30 seconds | Title, years, domains, shipped work, location, availability | Home and resume |
| Founder or agency | 1 to 2 minutes | Proof pages convert, what he offers, how to start | Pages that sell, then book a call |

The home page serves all three in that order without splitting into two sites. A separate /work-with-me page carries the freelance offer so the home page stays a product design portfolio.

## 3. Site map

* `/` Home
* `/work/[slug]` Case studies (ixigo, Google Pay Split and Request, Twelve, JARVIS Alerts, plus OneBanc if kept)
* `/work/profit-wala-love` NEW full case study on the site, because it is the only shipped work with hard numbers
* `/pages-that-sell` Commerce and landing page work (CosIQ, Beauty PDP, Basil, Big Birthday Bash, Profit Wala Love card), each with a short write up on the site rather than a bounce to Behance
* `/archive` UI explorations and graphic design, honestly labelled as visual and brand work
* `/about` Longer story, how he works, experience, photo, resume download
* `/work-with-me` Freelance offer: landing pages, store and product page UX audits, PDP redesigns, app and web product design; process; book a call
* `/resume` Redirect or page with the PDF

## 4. Home page structure

1. **Intro** (above the fold on desktop, and the first project starts peeking in): name, positioning line, supporting line, availability with a live dot, two text links (Resume, Book a call). No smoke background, no rotating word, no pill tag, no scroll hint.
2. **Selected work**: 4 or 5 case studies as large rows or a 2 column grid. Every item shows, in real text: project name, the headline line ("The four hours nobody designs for"), one line problem, role, type (Concept / Shipped), year, and a number where one exists. Image is supporting, not the whole card. No "View Project" button; the whole item is the link.
3. **Shipped results strip**: Profit Wala Love numbers as the proof moment. Real data only.
4. **Pages that sell**: 3 to 6 commerce pieces, each with a one line outcome, plus a "Need a page that sells?" path to /work-with-me.
5. **How I work**: 3 short principles drawn from the case studies (start with recordings and drop off, design the uncertain moment, honest copy over comforting copy). Each links to the case study that proves it.
6. **About in brief**: one photo, 3 sentences, experience in one line, link to /about.
7. **Contact**: one clear line, email, Book a call, LinkedIn, Behance.

## 5. Case study template

1. **Header**: eyebrow (client or product · type), the headline, a 2 sentence summary, then a facts row: Role, Scope, Type (Concept / Shipped), Timeline, Tools.
2. **30 second summary card**: Problem · Decision · Result (or the metric he would measure) · What I learned. Lets a hiring manager get the whole story before scrolling.
3. **Showreel** with captions and a poster frame, not repeated title text.
4. **Sticky table of contents** on desktop with reading progress.
5. **Body** in the order of the eight question standard, opening on the hardest decision.
6. **Screens** at real size with captions that say what changed, never floating alone.
7. **Tradeoffs and what I got wrong first** as a visible callout.
8. **Closing**: View the Figma file (primary) and Back to home (secondary), styled as in the Twelve page, then the next case study card.

## 6. Visual direction

Taste references from Vishal: Linear, Stripe, Teenage Engineering, MUJI. Restrained, systematic, intentional, not decorative.

* **Type led.** One strong sans for UI and headings (candidates: Albert Sans, Geist, Söhne alternative like Inter Display, or a grotesk with character) plus an optional serif for case study pull quotes. Never Archivo.
* **Light theme by default** with a dark mode. The current all black page plus smoke is the most template part of the site. A calm light page lets the colourful thumbnails carry the colour.
* **A visible grid.** 12 column, generous margins, consistent 8 point spacing. Let alignment do the design work.
* **Motion with restraint.** Fast, purposeful transitions (page to page, hover reveals of the one line outcome). No parallax, no smoke, no marquee. Respect reduced motion.
* **One signature detail** that feels like him, decided with Vishal in phase 2. Ideas: a small live status line ("Currently designing for six storefronts" style, but without naming the employer), a case study index set like a train departure board for ixigo, or project numbers in a mono face.

## 7. Phased plan (one phase per session)

| Phase | Output | Vishal approves |
|---|---|---|
| 0. Setup | Repo, Astro scaffold, Vercel preview, domain shortlist | Domain and stack |
| 1. Content and positioning | Positioning options, site map, home page copy, project summaries in text | Every word of home copy |
| 2. Design direction | 2 or 3 visual directions as live preview pages (home intro + one project row + one case study header) | One direction |
| 3. Design system | Tokens, type scale, grid, components, light and dark | Component page |
| 4. Home page | Full home on a preview URL, desktop and mobile | Home |
| 5. Pilot case study | ixigo rebuilt on the new template | Template |
| 6. Remaining pages | Other case studies, Pages that sell, archive, about, work with me | Each page |
| 7. SEO, performance, accessibility | All checks from CLAUDE.md passing | Report |
| 8. Launch | Domain live, Search Console verified, sitemap submitted, links updated on LinkedIn, Behance, CV, signature | Go live |
| 9. Measure | Analytics review after 2 and 6 weeks | Next iteration |

## 8. How we will know it worked

* Rank 1 for "Vishal Yadav product designer" within about 8 weeks of launch.
* More replies from design leads when the portfolio link is in the outreach.
* Calls booked from /work-with-me.
* Average time on case study pages above 2 minutes; scroll depth to the summary card near 100%.
* A design lead looking at the home page for 10 seconds can say what he does, what he is good at, and whether he has shipped.
