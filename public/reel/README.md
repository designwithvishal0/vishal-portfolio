# public/reel

Every file here is cut from Vishal's existing showreels. Nothing was redrawn or animated: only trims, crops, scaling and 0.4 to 0.5 s crossfades. All audio is stripped. To rebuild everything, run `bash public/reel/cut.sh` (takes about 5 minutes).

Sources, all 1920x1080 at 30 fps, in `/mnt/user-data/uploads/Downloads/`:

* IX: `ixigo-case-study-teaser-90s.mp4`
* SP: `Split-and-Request-Final/02-split-showreel-16x9.mp4` (the opening dinner photo is never used)
* TW: `Twelve-Final/02-twelve-showreel-16x9-voiceover.mp4`
* JV: `Staqu-Final/02-staqu-showreel-16x9-voiceover.mp4`

Times are source seconds, in to out. Every video loops: its last beat crossfades back into the first beat, so the first beat starts playing a crossfade length after its listed in point. Each poster `.jpg` is the video's first frame. No `.webm` is shipped because VP9 came out less than 10% smaller than the `.mp4` at the same quality.

## Hero reels

* `showreel-wide.mp4` (1600x900, 31.6 s, 0.4 s fades): IX 1.1 to 3.7 title · IX 46.2 to 52.8 One hub, Six states · SP 7.55 to 10.25 title · SP 33.1 to 39.5 drag each dish, shared dish · TW 80.2 to 82.8 end card, cropped to 1308x736 at 306,114 so its "Full case study below" line is out · TW 24.05 to 26.45 One number, every day · TW 40.8 to 44.5 Type it in · JV 45.3 to 47.9 end card · JV 6.15 to 9.55 90 to 99% · JV 33.8 to 36.4 success toast. Poster: IX 1.5.
* `showreel-tall.mp4` (1080x1350, 30.4 s, 0.4 s fades): IX 12.9 to 15.6 text column · IX 46.2 to 48.8 text column · IX 48.4 to 52.8 phone · SP 33.2 to 35.9 text column · SP 35.5 to 40.4 phone · TW 40.8 to 42.9 text column · TW 42.5 to 44.5 phone · TW 52.3 to 56.3 phone · JV 6.15 to 9.55 text column · JV 30.0 to 35.6 phone. Poster: IX 13.3.

## Per project loops (0.5 s fades)

* `ixigo-scene.mp4` (1280x720, 6.6 s): IX 45.8 to 52.9, full frame. Poster: IX 46.3.
* `ixigo-phone.mp4` (720x900, 6.6 s): IX 45.8 to 52.9, phone crop 853x1066 at 942,0. Poster: IX 46.3.
* `split-scene.mp4` (1280x720, 6.9 s): SP 33.2 to 40.6, full frame. Poster: SP 33.7.
* `split-phone.mp4` (720x900, 6.9 s): SP 33.2 to 40.6, phone crop 800x1000 at 1067,39. Poster: SP 33.7.
* `twelve-scene.mp4` (1280x720, 6.7 s): TW 40.7 to 44.4 then TW 52.3 to 56.3, full frame. Poster: TW 41.2.
* `twelve-phone.mp4` (720x900, 6.7 s): same two beats, phone crop 864x1080 at 865,0. Poster: TW 41.2.
* `jarvis-scene.mp4` (1280x720, 8.5 s): JV 26.4 to 35.4, full frame. Poster: JV 26.9.
* `jarvis-phone.mp4` (720x900, 7.3 s): JV 27.6 to 35.4, phone crop 864x1080 at 868,0. Poster: JV 28.1.

## Stills (`frames/`, 1600x900, full frame unless noted)

* `ixigo-1.jpg` IX 2.6 title · `ixigo-2.jpg` IX 23.9 the problem · `ixigo-3.jpg` IX 70.4 phone close · `ixigo-4.jpg` IX 56.3 one hub, chart failed state
* `split-1.jpg` SP 9.5 title · `split-2.jpg` SP 17.5 the problem · `split-3.jpg` SP 34.6 phone close · `split-4.jpg` SP 61.0 one split, four states
* `twelve-1.jpg` TW 82.0 title (same crop as the wide reel) · `twelve-2.jpg` TW 10.4 the problem · `twelve-3.jpg` TW 25.0 phone close · `twelve-4.jpg` TW 53.0 it warns you
* `jarvis-1.jpg` JV 46.8 title · `jarvis-2.jpg` JV 8.2 the problem · `jarvis-3.jpg` JV 38.8 phone close · `jarvis-4.jpg` JV 35.0 false alert noted
