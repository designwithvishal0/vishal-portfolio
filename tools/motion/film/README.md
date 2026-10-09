# Film motion pieces (F1 How I work, F2 end card)

Rebuild everything: `bash tools/motion/film/render-all.sh` (about 6 minutes; set FRAMES to choose the frame folder). Output goes to `public/film/motion/`.

* `film.js` draws each frame on a canvas as a pure function of time. Defocus is a disc kernel (circle of confusion), not a gaussian, so nothing glows. Motion blur is 270 degree temporal supersampling. Grain is a static 2% monochrome pattern applied only where there is content, so the ground stays exactly the page colour and the video has no visible edge.
* `render.cjs` renders frames or single stills with Playwright; `render-all.sh` encodes H.264 (CRF 23, bt709 tags, faststart) and VP9, and writes the posters.
