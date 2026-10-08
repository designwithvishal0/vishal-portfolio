# First message to paste into Claude Code

Copy everything inside the box below.

```
We are building my new personal portfolio website from scratch in this project. It replaces my Framer site at https://designwvishal.framer.website

Before anything else, read every file in this folder in this order: CLAUDE.md, 01-ANALYSIS.md, 02-STRATEGY.md, 03-CONTENT-INVENTORY.md. CLAUDE.md is how you work on this project for every session.

Today is Phase 0 and Phase 1 only. Do not write any site code yet.

1. Open my current live site and every case study on it (desktop and mobile) and read them fully. Check the analysis in 01-ANALYSIS.md against what you see. Tell me where you agree, where you disagree, and anything it missed. Be blunt; you are the lead designer here.
2. Look at the assets in my Downloads folders listed in 03-CONTENT-INVENTORY.md so you know what we actually have.
3. Ask me the open decisions from 00-START-HERE.md that you need answered (domain, email, OneBanc, archive) in one short list.
4. Give me 6 positioning lines (the 3 in 02-STRATEGY.md plus 3 of your own), each with one sentence on why, and your pick.
5. Give me the site map and the full home page copy in plain text, section by section, using only real facts from the inventory. Every project shown as text: name, headline line, one line problem, role, concept or shipped, year, and a number where one exists.
6. Set up the repo (git init, Astro scaffold, nothing styled) and a Vercel preview if I am logged in. No production deploy, no domain changes.

End with a short summary: what you did, what is waiting on me, and what Phase 2 will be.
```

## Prompts for later phases (use one per session)

**Phase 2, design direction**
```
Phase 2. Using the approved positioning and home copy, build 2 or 3 genuinely different visual directions as separate preview routes: home intro, one selected work row, and one case study header for each. Follow the visual direction in 02-STRATEGY.md and my taste references. Screenshot each at 1440 and 390, show me side by side, and tell me which one you would pick and why. Nothing should look like a template.
```

**Phase 4, home page**
```
Phase 4. Build the full home page in the approved direction and design system. Real content only. Preview URL, screenshots at 1440 and 390 full length, Lighthouse scores on mobile. Recheck every link and every word against CLAUDE.md rules before you show me.
```

**Phase 5, pilot case study**
```
Phase 5. Rebuild the ixigo case study on the new case study template from 02-STRATEGY.md using the live page text and the assets in Downloads. Check it against the eight question standard in CLAUDE.md and tell me which answers are still thin.
```

**Phase 8, launch**
```
Phase 8. Run the full pre launch checklist from CLAUDE.md (SEO, performance, accessibility, links, OG images, structured data). Show me the report. Do not deploy to production or touch DNS until I say go.
```
