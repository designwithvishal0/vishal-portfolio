#!/usr/bin/env bash
# Rebuild every Bento motion video: bash tools/motion/bento/render-all.sh  (about 6 minutes)
# sky.py draws the sky with numpy and pipes it to ffmpeg (also writes the posters and sky-calm.json).
# fold.js is drawn in Chromium by render.cjs; frames go to a temp dir, videos and posters to public/bento/motion/.
set -e
here="$(cd "$(dirname "$0")" && pwd)"; out="$here/../../../public/bento/motion"; tmp="${FRAMES:-/tmp/bento-frames}"
mkdir -p "$out"
python3 "$here/sky.py" "$out" > /dev/null &
for th in light dark; do node "$here/render.cjs" frames $th "$tmp/fold-$th" & done; wait
for th in light dark; do
  ffmpeg -v error -y -framerate 30 -i "$tmp/fold-$th/%04d.png" -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
    -c:v libx264 -profile:v high -preset veryslow -crf "${CRF:-24}" -g 60 -x264-params aq-mode=3 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -movflags +faststart -an "$out/fold-$th.mp4"
  ffmpeg -v error -y -framerate 30 -i "$tmp/fold-$th/%04d.png" -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
    -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -g 60 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -an "$out/fold-$th.webm"
  # poster: 6.0 s, the decided state
  node -e "require('$here/../../../node_modules/sharp')(process.argv[1]).jpeg({quality:82,mozjpeg:true}).toFile(process.argv[2])" "$tmp/fold-$th/0180.png" "$out/fold-$th.jpg"
done
# keep a .webm only when it beats the .mp4
for w in "$out"/*.webm; do m="${w%.webm}.mp4"; [ $(stat -c%s "$w") -lt $(stat -c%s "$m") ] || rm "$w"; done
ls -la "$out"
