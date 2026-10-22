# Bento motion pieces (Gurugram sky, fold film)

Rebuild everything: `bash tools/motion/bento/render-all.sh` (about 5 minutes; set FRAMES to choose the frame folder, CRF to retune the fold films). Output goes to `public/bento/motion/`.

* `sky.py` (numpy + ffmpeg) draws the sky as a pure function of the hour: 24 s, hour h at t = h, a keyframe every 0.5 s for exact seeking. It also writes the four posters and `sky-calm.json` (per half hour: average colour of the bottom left text zone and of the top text line, the scheduled type colour, and its contrast against the average and the 5th percentile pixel). Run alone: `python3 tools/motion/bento/sky.py public/bento/motion`.
* `fold.js` draws the fold film on a canvas as a pure function of t (springs, squash, contact shadows, 10 sample motion blur); `render.cjs` renders frames or stills with Playwright (`node render.cjs stills light <dir> 0,2.4,6`).
