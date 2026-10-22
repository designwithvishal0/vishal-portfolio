#!/usr/bin/env bash
# Rebuild every Kinetic motion asset: bash tools/motion/kinetic/render-all.sh  (about 5 minutes)
# Frames go to $FRAMES (default /tmp/kinetic-frames); videos, posters and webp frames to public/kinetic/motion/.
# CRF (default 28) tunes the questions films; ENCODE_ONLY=1 reuses the frames already in $FRAMES.
set -e
here="$(cd "$(dirname "$0")" && pwd)"; root="$here/../../.."; out="$root/public/kinetic/motion"; tmp="${FRAMES:-/tmp/kinetic-frames}"
crf="${CRF:-28}"
mkdir -p "$out"
jobs_list=("questions wide light" "questions wide dark" "questions tall light" "questions tall dark" "numerals x light" "numerals x dark")
[ -n "$ENCODE_ONLY" ] || { for j in "${jobs_list[@]}"; do set -- $j; node "$here/render.cjs" $1 $2 $3 "$tmp/$1-$2-$3" & done; wait; }
vf="scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"
tags="-color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv"
jpg() { node -e "require('$root/node_modules/sharp')(process.argv[1]).jpeg({quality:+process.argv[3],mozjpeg:true}).toFile(process.argv[2])" "$1" "$2" "$3"; }
# K1: 8 s, opens and ends on the settled list, keyframe every 2 s
for v in wide tall; do for th in light dark; do
  src="$tmp/questions-$v-$th"; base="$out/questions-$v-$th"
  ffmpeg -v error -y -framerate 30 -i "$src/%04d.png" -vf "$vf" -c:v libx264 -profile:v high -preset veryslow -crf "$crf" -g 60 \
    -x264-params aq-mode=3 $tags -movflags +faststart -an "$base.mp4"
  ffmpeg -v error -y -framerate 30 -i "$src/%04d.png" -vf "$vf" -c:v libvpx-vp9 -b:v 0 -crf 42 -row-mt 1 -g 60 $tags -an "$base.webm"
  jpg "$src/0000.png" "$base.jpg" 82   # 0.0 s: the settled list (the film opens and ends on it)
done; done
# K2: all intra master (every frame a keyframe) plus the 60 scrub frames (every second master frame, 900x900)
for th in light dark; do
  src="$tmp/numerals-x-$th"
  ffmpeg -v error -y -framerate 30 -i "$src/%04d.png" -vf "$vf" -c:v libx264 -profile:v high -preset veryslow -crf 20 \
    -x264-params keyint=1:min-keyint=1:scenecut=0 $tags -movflags +faststart -an "$out/numerals-$th.mp4"
  jpg "$src/0000.png" "$out/numerals-$th.jpg" 82
  mkdir -p "$out/numerals-$th"
  node -e "
    const sharp = require('$root/node_modules/sharp');
    (async () => { for (let i = 0; i < 60; i++) {
      const f = String(i * 2).padStart(4, '0'), o = 'f' + String(i + 1).padStart(2, '0') + '.webp';
      await sharp('$src/' + f + '.png').resize(900, 900, { kernel: 'lanczos3' }).webp({ quality: 72, effort: 6 }).toFile('$out/numerals-$th/' + o);
    } })();"
done
# keep a .webm only when it beats the .mp4
for w in "$out"/*.webm; do m="${w%.webm}.mp4"; [ $(stat -c%s "$w") -lt $(stat -c%s "$m") ] || rm "$w"; done
ls -la "$out"; du -sh "$out"/numerals-light "$out"/numerals-dark
