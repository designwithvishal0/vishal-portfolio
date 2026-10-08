# Portfolio Website Kit

Everything you need to start a new Claude Code project and build your own portfolio site from scratch, replacing the Framer site.

## What is in this folder

| File | What it is | Who reads it |
|---|---|---|
| 00-START-HERE.md | This file. Setup steps and decisions | You |
| CLAUDE.md | The project brain. Claude Code reads it on every session | Claude Code |
| 01-ANALYSIS.md | A senior design lead's review of the current site | You and Claude Code |
| 02-STRATEGY.md | What to build, how it should feel, and the phased plan | You and Claude Code |
| 03-CONTENT-INVENTORY.md | Every project, asset location, fact and link | Claude Code |
| 04-KICKOFF-PROMPT.md | The first message to paste into Claude Code | You |

## Setup, step by step

1. Make a new folder on your Mac, for example `~/Projects/vishal-portfolio`.
2. Copy all six files from this kit into that folder. `CLAUDE.md` must sit at the root of the folder, that is how Claude Code finds it.
3. Open that folder in Claude Code (desktop Code tab, or `cd ~/Projects/vishal-portfolio` then `claude` in Terminal).
4. Give Claude Code access to your Downloads folder when it asks, because every case study asset lives there (see 03-CONTENT-INVENTORY.md).
5. Open 04-KICKOFF-PROMPT.md, copy the prompt inside the box, paste it as your first message.
6. Claude Code will not write any code in the first session. It reads, asks you the open questions, and proposes the positioning and site map for your approval. That is on purpose.

## Decisions only you can make (have answers ready)

1. **Domain.** Buy your own. Ideas to check: vishalyadav.design, vishalyadav.in, vishalyadav.co, designwvishal.com. Claude Code can check availability, but you pay for it.
2. **Hosting.** Recommended: Vercel free plan to start (it is where Claude Code deploys most easily). Videos go on a video host, not inside the site, so you never hit a bandwidth wall again.
3. **What happens to the Framer site.** Recommended: keep it live until the new site launches, then point every link (LinkedIn, Behance, CV, email signature) to the new domain and unpublish Framer a few weeks later.
4. **Email on the site.** The Framer footer shows design.vishaly@gmail.com while your CV uses vishaly0109@gmail.com. Pick one.
5. **Graphic design work.** Recommended: move it off the home page into an archive page. Decide if you agree.
6. **OneBanc.** It is hidden on desktop right now. Decide if it is in or out.

## How to work with Claude Code on this

* One phase per session. Do not ask for the whole site in one go.
* Every phase ends with something you can look at (a doc, a preview URL, a screenshot). Approve before the next phase.
* If something reads like a template, say so. The whole point of this rebuild is that it should not.
