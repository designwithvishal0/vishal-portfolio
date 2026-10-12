#!/usr/bin/env bash
# Kinetic home page loops for Split and JARVIS (2026-10-11), cut from Vishal's showreels with public/reel/cut.sh's reel().
# The Twelve loop is not cut: tools/twelve-loop renders it from his Figma file.
# Usage: bash public/kinetic/reel/cut.sh
set -euo pipefail
cd "$(dirname "$0")"
eval "$(sed -n '/^FF=/,/^# 1\. Hero/p' ../../reel/cut.sh | sed '$d')"   # reuse FF, TMP, sources, crops, jpg() and reel()
# Split: "One split, four states". The four states build one by one, then "Four reasons to open the app".
reel split-scene 1280 720 22 0.5 1 "$SP 47.8 15.6 $FULL"
# JARVIS: the 3 AM flood (90 to 99% are false), one correction, then the payoff: same car, no alert.
reel jarvis-scene 1280 720 22 0.5 1 "$JV 5.8 3.8 $FULL" "$JV 33.8 2.6 $FULL" "$JV 37.5 2.4 $FULL"
reel jarvis-phone 720 900 22 0.5 1 "$JV 5.8 3.8 $JV_PHONE" "$JV 33.8 2.6 $JV_PHONE" "$JV 37.5 2.4 $JV_PHONE"
# Phone (mobile audit 2026-10-12): built from split-scene.mp4 so all four states fit. The strip pans from the first two phones to the
# last two as they appear, and pans back for the loop; title and the closing line sit fixed, the line broken onto two lines.
X="151+474*(st(0,clip((t-4.5)/1.1,0,1))*ld(0)*(3-2*ld(0)))-474*(st(1,clip((t-13.7)/1.0,0,1))*ld(1)*(3-2*ld(1)))"
$FF -i split-scene.mp4 -filter_complex "
color=c=0xF6F7FC:s=720x900:r=30:d=15.1[bg];
color=c=white:s=625x655:d=1,format=gray,geq=lum='255*min(min(X/34\\,(W-1-X)/34)\\,1)*min(min(Y/20\\,(H-1-Y)/30)\\,1)'[mk];
[0:v]split=4[a][b][c][d];
[a]crop=500:524:'$X':116,scale=625:655:flags=lanczos,format=rgba[s0];[mk]loop=-1:1,[s0]alphamerge[strip];
[b]crop=440:84:96:28,scale=550:105:flags=lanczos,format=rgba,colorkey=0xF6F7FC:0.09:0.12[title];
[c]crop=394:34:210:655,scale=492:42:flags=lanczos,format=rgba,colorkey=0xF6F7FC:0.09:0.12[l1];
[d]crop=467:34:603:655,scale=584:42:flags=lanczos,format=rgba,colorkey=0xF6F7FC:0.09:0.12[l2];
[bg][title]overlay=30:34[o1];[o1][strip]overlay=47:129:shortest=1[o2];[o2][l1]overlay=34:790:shortest=1[o3];[o3][l2]overlay=34:836:shortest=1,format=yuv420p" \
  -t 15.1 -c:v libx264 -crf 22 -preset slow -movflags +faststart -an split-phone.mp4
# Split posters show all four states (SP 60.5), not the empty first frame, like the ixigo "lit" posters
$FF -ss 60.5 -i "$SP" -frames:v 1 -vf scale=1280:720:flags=lanczos -q:v 3 split-scene.jpg
$FF -ss 12 -i split-phone.mp4 -frames:v 1 -q:v 3 split-phone.jpg
# Lighter hero reel for phones (mobile polish 2026-10-12): the same cut as hero-tall.mp4 at 720x900, about 0.8 MB instead of 1.8 MB
# phones: the tall reel scaled down, with the Split chapter swapped for the two phone moments of the Split row loop (margins kept, no lone phone off centre); chapters move to 0, 6.3, 14.1, 22.3 s (phoneChapters in kinetic.astro) (Vishal 2026-10-12)
$FF -i hero-tall.mp4 -vf scale=720:900:flags=lanczos -c:v libx264 -crf 27 -preset slow -movflags +faststart -an hero-phone-base.mp4
# Split on phones (Vishal 2026-10-12, 14:09): each pair of phones gets about 3 s, the strip sits 10% smaller and higher, and the closing line takes the title's place at the top, 10% smaller so it clears the pause button so the chapter label and bars at the bottom never cover it
# Twelve (Vishal 2026-10-12): its own phone render, copy centred and the whole phone centred below it (tools/twelve-loop/render.mjs <dir> phone raw; set TWP to that dir)
TWP=${TWP:?set TWP to the folder holding twelve-hero-phone-raw.mkv}
$FF -i hero-phone-base.mp4 -i split-phone.mp4 -i "$TWP/twelve-hero-phone-raw.mkv" -filter_complex "[0:v]trim=0:6.1,setpts=PTS-STARTPTS,fps=30,format=yuv420p,tpad=stop_mode=clone:stop_duration=0.4,settb=AVTB[a];[1:v]trim=3.2:4.4,setpts=PTS-STARTPTS,fps=30,format=yuv420p,tpad=stop_mode=clone:stop_duration=2.0,settb=AVTB[b1];[1:v]trim=8.7:14.0,setpts=PTS-STARTPTS,fps=30,format=yuv420p,settb=AVTB[b2];[b1][b2]xfade=transition=fade:duration=0.3:offset=2.9,split=3[s1][s2][s3];[s1]crop=720:129:0:0[st];[s2]crop=720:655:0:129,scale=648:590:flags=lanczos[sm];[s3]crop=720:110:0:780,scale=648:99:flags=lanczos,format=rgba,pad=720:120:0:8:color=0xF6F7FCFF,fade=in:st=4.0:d=0.8:alpha=1[sl];color=c=0xF6F7FC:s=720x900:r=30:d=8.2[sb];[sb][st]overlay=0:0[q1];[q1][sm]overlay=36:129[q2];[q2][sl]overlay=0:14:shortest=1,format=yuv420p,settb=AVTB[b];[2:v]trim=0:8.4,setpts=PTS-STARTPTS,scale=720:900:flags=lanczos,fps=30,format=yuv420p,setsar=1,tpad=start_mode=clone:start_duration=0.4,settb=AVTB[c];[0:v]trim=30.1,setpts=PTS-STARTPTS,fps=30,format=yuv420p,tpad=start_mode=clone:start_duration=0.4,settb=AVTB[d];[a][b]xfade=transition=fade:duration=0.4:offset=6.1[ab];[ab][c]xfade=transition=fade:duration=0.4:offset=13.9[abc];[abc][d]xfade=transition=fade:duration=0.4:offset=21.9[out]" -map "[out]" -an -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart hero-phone.mp4
rm hero-phone-base.mp4
