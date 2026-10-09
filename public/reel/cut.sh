#!/usr/bin/env bash
# Rebuilds every file in public/reel from Vishal's existing showreels.
# Only cuts, trims, crops, scales and 0.4 to 0.5 s crossfades. No new design, no audio.
# Usage: bash public/reel/cut.sh   (needs ffmpeg with libx264, libvpx-vp9 and xfade)
set -euo pipefail
cd "$(dirname "$0")"
FF="ffmpeg -hide_banner -loglevel error -y"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
DL=/mnt/user-data/uploads/Downloads
IX=$DL/ixigo-case-study-teaser-90s.mp4                                # ixigo Trains, 86.7 s
SP=$DL/Split-and-Request-Final/02-split-showreel-16x9.mp4             # Google Pay Split and Request, 87 s
TW=$DL/Twelve-Final/02-twelve-showreel-16x9-voiceover.mp4             # Twelve, 84.9 s
JV=$DL/Staqu-Final/02-staqu-showreel-16x9-voiceover.mp4               # Staqu JARVIS Alerts, 49.5 s

# Crop rectangles in source pixels (1920x1080), x:y:w:h
FULL=0:0:1920:1080
TW_TITLE=306:114:1308:736      # Twelve end card without its "Full case study below" line
IX_TEXT=101:0:864:1080         # 4:5 text column, ixigo
IX_PHONE=942:0:853:1066        # 4:5 around the ixigo phone, even top and bottom margin
SP_TEXT=121:0:864:1080
SP_PHONE=1067:39:800:1000
TW_TEXT=60:0:864:1080
TW_PHONE=865:0:864:1080
JV_TEXT=81:0:864:1080
JV_PHONE=868:0:864:1080

# jpg OUT MAXBYTES ffmpeg-args...   writes the best jpg quality that fits the byte budget
jpg() {
  local out=$1 max=$2 q; shift 2
  for q in 2 3 4 5 6 7 8 9 10; do
    $FF "$@" -frames:v 1 -q:v "$q" "$out"
    [ "$(stat -c%s "$out")" -le "$max" ] && return
  done
}

# reel OUT W H CRF XFADE LOOP beat...   beat = "SRC START DUR CROP"
# Beats are joined with crossfades. LOOP=1 crossfades the tail back into the head
# and trims the head, so the last frame flows into the first.
reel() {
  local out=$1 w=$2 h=$3 crf=$4 d=$5 loop=$6; shift 6
  local beats=("$@") ins=() fc="" i len s st du c cx cy cw ch off prev=v0
  if [ "$loop" = 1 ]; then read -r s st _ c <<<"${beats[0]}"; beats+=("$s $st $d $c"); fi
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
  if [ "$loop" = 1 ]; then fc+="[$prev]trim=start=$d,setpts=PTS-STARTPTS[out]"; else fc+="[$prev]null[out]"; fi
  # lossless master first, so the mp4 and the webm are both encoded from clean frames
  $FF "${ins[@]}" -filter_complex "$fc" -map "[out]" -an -r 30 -c:v libx264 -qp 0 -preset ultrafast -pix_fmt yuv420p "$TMP/$out.mkv"
  $FF -i "$TMP/$out.mkv" -an -c:v libx264 -profile:v high -preset veryslow -crf "$crf" -pix_fmt yuv420p -movflags +faststart "$out.mp4"
  $FF -i "$TMP/$out.mkv" -an -c:v libvpx-vp9 -crf "$((crf + 12))" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$out.webm"
  # keep the webm only when it is at least 10% smaller than the mp4. On this flat UI footage VP9
  # landed within 10% of x264 at matched quality, so no webm survives today.
  if [ $(( $(stat -c%s "$out.webm") * 10 )) -ge $(( $(stat -c%s "$out.mp4") * 9 )) ]; then rm "$out.webm"; fi
  # poster = first frame, so the swap from poster to video does not jump. 80 KB or less.
  jpg "$out.jpg" 80000 -i "$TMP/$out.mkv"
}

# still OUT SRC TIME CROP   1600x900 jpg, 120 KB or less
still() { jpg "$1" 120000 -ss "$3" -i "$2" -vf "crop=$(awk -F: '{print $3":"$4":"$1":"$2}' <<<"$4"),scale=1600:900:flags=lanczos"; }

# 1. Hero, wide. ixigo, Split, Twelve, JARVIS. Title or problem beat, then the phone.
reel showreel-wide 1600 900 "${CRF_WIDE:-22}" 0.4 1 \
  "$IX 1.1 2.6 $FULL"        "$IX 46.2 6.6 $FULL" \
  "$SP 7.55 2.7 $FULL"       "$SP 33.1 6.4 $FULL" \
  "$TW 80.2 2.6 $TW_TITLE"   "$TW 24.05 2.4 $FULL"   "$TW 40.8 3.7 $FULL" \
  "$JV 45.3 2.6 $FULL"       "$JV 6.15 3.4 $FULL"    "$JV 33.8 2.6 $FULL"

# 2. Hero, tall 4:5 for phones. Same story from 4:5 crops: text column, then the device.
reel showreel-tall 1080 1350 "${CRF_TALL:-22}" 0.4 1 \
  "$IX 12.9 2.7 $IX_TEXT"    "$IX 46.2 2.6 $IX_TEXT"  "$IX 48.4 4.4 $IX_PHONE" \
  "$SP 33.2 2.7 $SP_TEXT"    "$SP 35.5 4.9 $SP_PHONE" \
  "$TW 40.8 2.1 $TW_TEXT"    "$TW 42.5 2.0 $TW_PHONE" "$TW 52.3 4.0 $TW_PHONE" \
  "$JV 6.15 3.4 $JV_TEXT"    "$JV 30.0 5.6 $JV_PHONE"

# 3. Per project: scene (title text with the phone, 1280x720) and phone only (720x900)
reel ixigo-scene  1280 720 "${CRF_SCENE:-23}" 0.5 1 "$IX 45.8 7.1 $FULL"
reel ixigo-phone  720  900 "${CRF_PHONE:-23}" 0.5 1 "$IX 45.8 7.1 $IX_PHONE"
reel split-scene  1280 720 "${CRF_SCENE:-23}" 0.5 1 "$SP 33.2 7.4 $FULL"
reel split-phone  720  900 "${CRF_PHONE:-23}" 0.5 1 "$SP 33.2 7.4 $SP_PHONE"
reel twelve-scene 1280 720 "${CRF_SCENE:-23}" 0.5 1 "$TW 40.7 3.7 $FULL"     "$TW 52.3 4.0 $FULL"
reel twelve-phone 720  900 "${CRF_PHONE:-23}" 0.5 1 "$TW 40.7 3.7 $TW_PHONE" "$TW 52.3 4.0 $TW_PHONE"
reel jarvis-scene 1280 720 "${CRF_SCENE:-23}" 0.5 1 "$JV 26.4 9.0 $FULL"
reel jarvis-phone 720  900 "${CRF_PHONE:-23}" 0.5 1 "$JV 27.6 7.8 $JV_PHONE"

# 4. Stills: title, problem, phone, signature moment
mkdir -p frames
still frames/ixigo-1.jpg  "$IX" 2.6  $FULL
still frames/ixigo-2.jpg  "$IX" 23.9 $FULL
still frames/ixigo-3.jpg  "$IX" 70.4 $FULL
still frames/ixigo-4.jpg  "$IX" 56.3 $FULL
still frames/split-1.jpg  "$SP" 9.5  $FULL
still frames/split-2.jpg  "$SP" 17.5 $FULL
still frames/split-3.jpg  "$SP" 34.6 $FULL
still frames/split-4.jpg  "$SP" 61.0 $FULL
still frames/twelve-1.jpg "$TW" 82.0 $TW_TITLE
still frames/twelve-2.jpg "$TW" 10.4 $FULL
still frames/twelve-3.jpg "$TW" 25.0 $FULL
still frames/twelve-4.jpg "$TW" 53.0 $FULL
still frames/jarvis-1.jpg "$JV" 46.8 $FULL
still frames/jarvis-2.jpg "$JV" 8.2  $FULL
still frames/jarvis-3.jpg "$JV" 38.8 $FULL
still frames/jarvis-4.jpg "$JV" 35.0 $FULL
