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
# Phone hero reel, remade from scratch (Vishal 2026-10-13, "remake the full reel again for mobile"): cut from his own vertical 9:16 showreels
# in ~/Downloads, product screens only (no title cards, the hero headline already sits above), one 4:5 window per beat with the whole phone in it.
# Beats: ixigo's six states, Split's four states, Twelve's one number, JARVIS flood then the correction. Chapters move to phoneChapters in kinetic.astro.
DL=${DL:-/mnt/user-data/uploads/Downloads}
IXV=$DL/ixigo-case-study-teaser-90s-vertical.mp4; SPV=$DL/Split-and-Request-Final/02b-split-showreel-9x16-mobile.mp4
TWV=$DL/01-twelve-showreel-linkedin-9x16.mp4; JVV=$DL/Staqu-Final/LinkedIn/01-staqu-showreel-linkedin-9x16.mp4
B=("$IXV 46 8 1000:1250:40:650" "$SPV 49 8 1040:1300:20:432" "$TWV 24 7 1080:1350:0:570" "$JVV 4.5 5.5 1080:1350:0:570" "$JVV 29 6 1080:1350:0:560")   # crop w:h:x:y, always 4:5
ins=(); fc=""; for n in "${!B[@]}"; do read -r s st du c <<<"${B[$n]}"; ins+=(-ss "$st" -t "$du" -i "$s"); fc+="[$n:v]crop=$c,scale=720:900:flags=lanczos,fps=30,format=yuv420p,setsar=1,settb=AVTB[v$n];"; done
# 0.4 s crossfades; offsets are the running length minus the fade
fc+="[v0][v1]xfade=transition=fade:duration=0.4:offset=7.6[a];[a][v2]xfade=transition=fade:duration=0.4:offset=15.2[b];[b][v3]xfade=transition=fade:duration=0.4:offset=21.8[c];[c][v4]xfade=transition=fade:duration=0.4:offset=26.9[out]"
$FF "${ins[@]}" -filter_complex "$fc" -map "[out]" -an -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart hero-phone.mp4
$FF -ss 3 -i hero-phone.mp4 -frames:v 1 -q:v 3 hero-phone.jpg
