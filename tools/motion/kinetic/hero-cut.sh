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

# Wide 16:9: one UI beat per project (ixigo opens on its backup plan sheet, not the reframe beat its work row already shows)
reel hero-wide 1600 900 23 \
  "$IX 61.8 6.4 $FULL"  "$SP 33.1 6.4 $FULL"  "$TW 24.05 2.4 $FULL"  "$TW 40.8 3.7 $FULL"  "$JV 6.15 3.4 $FULL"  "$JV 33.8 2.6 $FULL"
# Tall 4:5 for phones: the phone crops only
reel hero-tall 1080 1350 23 \
  "$IX 61.8 6.4 $IX_PHONE"  "$SP 35.5 4.9 $SP_PHONE"  "$TW 42.5 2.0 $TW_PHONE"  "$TW 52.3 4.0 $TW_PHONE"  "$JV 30.0 5.6 $JV_PHONE"
ls -la "$out"
