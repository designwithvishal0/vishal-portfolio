#!/usr/bin/env bash
# VP9 WebM copies of the eight work tile cuts in public/reel, for browsers without H.264.
# Same encoder settings as hero.sh (crf + 12 on the VP9 pass). Usage: bash tools/motion/bento/reel-webm.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
OUT=public/bento/reel; mkdir -p "$OUT"
for k in ixigo split twelve jarvis; do for c in scene phone; do
  ffmpeg -hide_banner -loglevel error -y -i "public/reel/$k-$c.mp4" -an -c:v libvpx-vp9 -crf 33 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$OUT/$k-$c.webm"
  echo "$k-$c: mp4 $(stat -c%s public/reel/$k-$c.mp4), webm $(stat -c%s $OUT/$k-$c.webm)"
done; done
