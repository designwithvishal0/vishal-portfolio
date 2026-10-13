#!/usr/bin/env bash
# Kinetic hero reels: the same four project beats as public/reel/showreel-*, minus every title card and text column,
# so the hero opens on product UI at frame 0. Cut from Vishal's own showreels with the crops and 0.4 s crossfades
# that public/reel/cut.sh uses; nothing redrawn. Usage: bash tools/motion/kinetic/hero-cut.sh  (about 2 minutes)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"; out="$here/../../../public/kinetic/reel"; mkdir -p "$out"; cd "$out"
FF="ffmpeg -hide_banner -loglevel error -y"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
DL=/mnt/user-data/uploads/Downloads
IX=$DL/ixigo-case-study-teaser-90s.mp4
SP=$DL/Split-and-Request-Final/02-split-showreel-16x9.mp4
TW=$DL/Twelve-Final/02-twelve-showreel-16x9-voiceover.mp4
JV=$DL/Staqu-Final/02-staqu-showreel-16x9-voiceover.mp4
FULL=0:0:1920:1080
IX_PHONE=942:0:853:1066; SP_PHONE=1067:39:800:1000; TW_PHONE=865:0:864:1080; JV_PHONE=868:0:864:1080

# reel OUT W H CRF beat...   beat = "SRC START DUR CROP"; looped: the tail crossfades into the head
reel() {
  local out=$1 w=$2 h=$3 crf=$4 d=0.4; shift 4
  local beats=("$@") ins=() fc="" i len s st du c cx cy cw ch off prev=v0
  read -r s st _ c <<<"${beats[0]}"; beats+=("$s $st $d $c")
  for i in "${!beats[@]}"; do
    read -r s st du c <<<"${beats[$i]}"
    ins+=(-ss "$st" -t "$du" -i "$s")
    if [ "$c" = PAD ]; then fc+="[$i:v]scale=-2:$h:flags=lanczos,pad=$w:$h:(ow-iw)/2:0:0xF2EFE5,fps=30,format=yuv420p,setsar=1,settb=AVTB[v$i];"; continue; fi
    IFS=: read -r cx cy cw ch <<<"$c"
    fc+="[$i:v]crop=$cw:$ch:$cx:$cy,scale=$w:$h:flags=lanczos,fps=30,format=yuv420p,setsar=1,settb=AVTB[v$i];"
  done
  read -r _ _ len _ <<<"${beats[0]}"
  for ((i=1; i<${#beats[@]}; i++)); do
    read -r _ _ du _ <<<"${beats[$i]}"
    off=$(awk "BEGIN{printf \"%.4f\", $len-$d}")
    fc+="[$prev][v$i]xfade=transition=fade:duration=$d:offset=$off[x$i];"; prev=x$i
    len=$(awk "BEGIN{printf \"%.4f\", $len+$du-$d}")
  done
  fc+="[$prev]trim=start=$d,setpts=PTS-STARTPTS[out]"
  $FF "${ins[@]}" -filter_complex "$fc" -map "[out]" -an -r 30 -c:v libx264 -qp 0 -preset ultrafast -pix_fmt yuv420p "$TMP/$out.mkv"
  $FF -i "$TMP/$out.mkv" -an -c:v libx264 -profile:v high -preset veryslow -crf "$crf" -pix_fmt yuv420p -movflags +faststart "$out.mp4"
  $FF -i "$TMP/$out.mkv" -frames:v 1 -q:v 3 "$out.jpg"
}

# The hero plays the four Selected work loops back to back (Vishal 2026-10-11: the reel should show what the rows show).
# Every beat comes from his *-Final exports only (Vishal 2026-10-13: "why do you keep using the non-final one").
TWT=$DL/Twelve-Final/01-twelve-showreel-linkedin-9x16.mp4
# Wide 16:9: ixigo's six states, Split's four states, Twelve's safe to spend, JARVIS flood then correction
reel hero-wide 1600 900 23 \
  "$IX 45.8 7.1 $FULL"  "$SP 47.8 15.6 $FULL"  "$TW 23.6 10 $FULL"  "$JV 5.8 6 $FULL"  "$JV 33 6.9 $FULL"
# Tall 4:5 for phones: the same beats, phone crops
reel hero-tall 1080 1350 23 \
  "$IX 45.8 7.1 $IX_PHONE"  "$SP 47.8 15.6 150:0:864:1080"  "$TWT 23.6 10 PAD"  "$JV 26 12.9 $JV_PHONE"
# posters open on ixigo's chart failed state with its caption lit, the same frame as the ixigo row poster
$FF -ss 56.0 -i "$IX" -frames:v 1 -vf scale=1600:900:flags=lanczos -q:v 3 hero-wide-lit.jpg
$FF -ss 56.0 -i "$IX" -frames:v 1 -vf "crop=853:1066:942:0,scale=1080:1350:flags=lanczos" -q:v 3 hero-tall.jpg
ls -la "$out"
