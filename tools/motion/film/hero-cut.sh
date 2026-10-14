#!/usr/bin/env bash
# Film hero reels, phone only: the four public/reel/<key>-phone.mp4 loops back to back, so no frame carries
# a headline or a text column from his showreels and the page caption is the only headline on screen.
# Tall (864x1080) is the phone cut as is. Wide (1600x900) puts the phone cut on its reel's own ground, edges feathered.
# Light opens on Split (a light ground), dark on ixigo. Loops seamlessly (last beat crossfades into the first).
# Writes public/film/reel/hero-{wide,tall}-{light,dark}.{mp4,webm,jpg} and prints the cut points (seconds) for film.astro.
set -e
cd "$(dirname "$0")/../../.."
R=public/reel; O=public/film/reel; F=0.4; T=$(mktemp -d)
declare -A G=( [ixigo]=0x0B0C10 [split]=0xF6F8FC [twelve]=0xF2F0E4 [jarvis]=0xF5F6FB )
for k in ixigo split twelve jarvis; do
  ffmpeg -v error -y -i $R/$k-phone.mp4 -vf "fps=30,scale=864:1080,format=yuv420p" -an -c:v libx264 -crf 14 -preset fast $T/$k-tall.mp4
  ffmpeg -v error -y -f lavfi -i "color=c=${G[$k]}:s=1600x900:r=30" -i $R/$k-phone.mp4 -filter_complex \
    "[1:v]fps=30,scale=720:900,format=yuva420p,geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='255*clip(min(X,W-1-X)/72,0,1)'[p];[0:v][p]overlay=440:0:shortest=1,format=yuv420p" \
    -an -c:v libx264 -crf 14 -preset fast $T/$k-wide.mp4
done
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
cut() { # name size order...
  local name=$1 sz=$2; shift 2; local keys=("$@") ins=() fc="" lens=() i=0 cuts=""
  # A' = first loop minus its opening F, then B C D, then A0 = the opening F of the first loop
  local a=$T/${keys[0]}-$sz.mp4 da=$(dur $T/${keys[0]}-$sz.mp4)
  local parts=("$a $F $da")
  for k in "${keys[@]:1}"; do parts+=("$T/$k-$sz.mp4 0 $(dur $T/$k-$sz.mp4)"); done
  parts+=("$a 0 $F")
  for p in "${parts[@]}"; do set -- $p; ins+=(-i "$1"); local L=$(echo "$3 - $2" | bc)
    fc+="[$i:v]trim=$2:$3,setpts=PTS-STARTPTS[s$i];"; lens+=($L); i=$((i+1)); done
  local prev="s0" off=${lens[0]}
  for j in 1 2 3 4; do off=$(echo "$off - $F" | bc); fc+="[$prev][s$j]xfade=transition=fade:duration=$F:offset=$off[x$j];"; cuts+="$(echo "$off + $F/2" | bc) "; prev="x$j"; off=$(echo "$off + ${lens[$j]}" | bc); done
  ffmpeg -v error -y "${ins[@]}" -filter_complex "${fc%;}" -map "[$prev]" -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 25 -preset slow -movflags +faststart $O/$name.mp4
  ffmpeg -v error -y -i $O/$name.mp4 -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -an $O/$name.webm
  ffmpeg -v error -y -i $O/$name.mp4 -frames:v 1 -q:v 3 $O/$name.jpg
  echo "$name order=${keys[*]} cuts=$cuts dur=$(dur $O/$name.mp4)"
}
cut hero-wide-dark  wide ixigo split twelve jarvis
cut hero-wide-light wide split twelve jarvis ixigo
cut hero-tall-dark  tall ixigo split twelve jarvis
cut hero-tall-light tall split twelve jarvis ixigo
rm -rf $T
