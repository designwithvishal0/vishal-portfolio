#!/usr/bin/env bash
# Rebuild every Film motion video: bash tools/motion/film/render-all.sh  (about 6 minutes)
# Frames go to a temp dir, videos and posters to public/film/motion/.
set -e
here="$(cd "$(dirname "$0")" && pwd)"; out="$here/../../../public/film/motion"; tmp="${FRAMES:-/tmp/film-frames}"
mkdir -p "$out"
jobs_list=("how wide dark" "how wide light" "how tall dark" "how tall light" "endcard x dark" "endcard x light")
for j in "${jobs_list[@]}"; do set -- $j; node "$here/render.cjs" frames $1 $2 $3 "$tmp/$1-$2-$3" & done; wait
enc() { # src dir, out base, crf
  ffmpeg -v error -y -framerate 30 -i "$1/%04d.png" -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
    -c:v libx264 -profile:v high -preset veryslow -crf "$3" -g 60 -x264-params aq-mode=3 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -movflags +faststart -an "$2.mp4"
  ffmpeg -v error -y -framerate 30 -i "$1/%04d.png" -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
    -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 -g 60 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -an "$2.webm"
}
jpg() { node -e "require('$here/../../../node_modules/sharp')(process.argv[1]).jpeg({quality:+process.argv[3],mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(process.argv[2])" "$1" "$2" "$3"; }
for v in wide tall; do for th in dark light; do
  enc "$tmp/how-$v-$th" "$out/how-$v-$th" 23
  jpg "$tmp/how-$v-$th/0405.png" "$out/how-$v-$th.jpg" 80   # 13.5 s, act 3 settled
done; done
for th in dark light; do
  enc "$tmp/endcard-x-$th" "$out/endcard-$th" 23
  jpg "$tmp/endcard-x-$th/0000.png" "$out/endcard-$th-start.jpg" 78
  jpg "$tmp/endcard-x-$th/0143.png" "$out/endcard-$th-end.jpg" 85
done
# keep a .webm only when it beats the .mp4
for w in "$out"/*.webm; do m="${w%.webm}.mp4"; [ $(stat -c%s "$w") -lt $(stat -c%s "$m") ] || rm "$w"; done
ls -la "$out"
