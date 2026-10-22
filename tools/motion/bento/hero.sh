#!/usr/bin/env bash
# Bento hero reels: a recut of Vishal's own showreels where every project opens on its phone UI, never on a title card.
# Only trims, crops, scaling and 0.4 s crossfades (same method as public/reel/cut.sh). No audio.
# The ixigo beat is the backup plan sheet ("One tap, not ten screens"), so the hero never repeats the ixigo work tile.
# Usage: bash tools/motion/bento/hero.sh   writes public/bento/hero/hero-{wide,tall}.{mp4,webm,jpg}
set -euo pipefail
cd "$(dirname "$0")/../../.."
OUT=public/bento/hero; mkdir -p "$OUT"
FF="ffmpeg -hide_banner -loglevel error -y"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
DL=/mnt/user-data/uploads/Downloads
IX=$DL/ixigo-case-study-teaser-90s.mp4
SP=$DL/Split-and-Request-Final/02-split-showreel-16x9.mp4
TW=$DL/Twelve-Final/02-twelve-showreel-16x9-voiceover.mp4
JV=$DL/Staqu-Final/02-staqu-showreel-16x9-voiceover.mp4
FULL=0:0:1920:1080
# 4:5 crops around each phone, clear of the left text column so no line of his type is cut
IX_P=960:0:864:1080
SP_P=968:0:864:1080
TW_P=916:0:864:1080
JV_P=900:0:864:1080

reel() {  # OUT W H CRF beat...   beat = "SRC START DUR CROP"; loops: the tail crossfades into the head
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
  $FF -i "$TMP/$out.mkv" -an -c:v libx264 -profile:v high -preset veryslow -crf "$crf" -tune animation -pix_fmt yuv420p -movflags +faststart "$OUT/$out.mp4"
  $FF -i "$TMP/$out.mkv" -an -c:v libvpx-vp9 -crf "$((crf + 12))" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$OUT/$out.webm"
  $FF -i "$TMP/$out.mkv" -frames:v 1 -q:v 3 "$OUT/$out.jpg"
  echo "$out: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$out.mp4") s, mp4 $(stat -c%s "$OUT/$out.mp4"), webm $(stat -c%s "$OUT/$out.webm")"
}

# Project boundaries in the output (used by the caption chip): 0, 5.2, 9.4, 13.4; loop 18.6 s
reel hero-wide 1920 1080 "${CRF:-21}" \
  "$IX 59.6 5.6 $FULL" "$SP 42.3 4.6 $FULL" "$TW 29.3 4.4 $FULL" "$JV 6.2 5.6 $FULL"
reel hero-tall 1080 1350 "${CRF:-21}" \
  "$IX 59.6 5.6 $IX_P" "$SP 42.3 4.6 $SP_P" "$TW 29.3 4.4 $TW_P" "$JV 6.2 5.6 $JV_P"
