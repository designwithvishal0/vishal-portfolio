#!/bin/bash
cd "$(dirname "$0")"
# Phone (720x900) recut of the Contra showreel. Split scenes: text crop on top, phone crop below. Full scenes: whole 4:3 frame centred. Blurred frame behind.
set -e
V=${V:-$PWD/../../kinetic-reel/contra.mp4}; OUT=$PWD; T=$(mktemp -d); cd "$T"
TH=${TH:-300}
BG="[0:v]scale=720:900:force_original_aspect_ratio=increase,crop=720:900,boxblur=24:2,eq=brightness=-0.06[bg]"
seg(){ # name start end text_crop phone_crop
  local n=$1 a=$2 b=$3
  if [ "$4" = full ]; then
    F="$BG;[0:v]scale=720:540[f];[bg][f]overlay=0:180"
  else
    local PH=$((900-TH-70))
    F="$BG;[0:v]crop=$4,scale=680:$TH:force_original_aspect_ratio=decrease,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1,min(min(X,W-X),min(Y,H-Y))/36)'[t];[0:v]crop=$5,scale=680:$PH:force_original_aspect_ratio=decrease,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1,min(min(X,W-X),min(Y,H-Y))/36)'[p];[bg][t]overlay=24:36[x];[x][p]overlay=(W-w)/2:$((TH+50))"
  fi
  ffmpeg -v error -y -ss $a -to $b -i "$V" -filter_complex "$F,fps=30,format=yuv420p" -an -c:v libx264 -crf 18 -preset fast $n.mp4
}
seg s1 0 12.9 full
seg s2 12.9 18.6 580:440:10:170 340:700:720:90
seg s3 18.6 23.4 600:450:0:160 480:710:680:120
seg s4 23.4 28.9 600:560:10:180 500:610:650:145
seg s5 28.9 33.4 full
seg s6 33.4 39.0 680:660:0:120 310:660:810:130
seg s7 39.0 45 full
printf "file '%s'\n" s1.mp4 s2.mp4 s3.mp4 s4.mp4 s5.mp4 s6.mp4 s7.mp4 > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c:v libx264 -crf 27 -preset slow -movflags +faststart -an "$OUT/hero-phone.mp4"
ffmpeg -v error -y -ss 14 -i "$OUT/hero-phone.mp4" -frames:v 1 -q:v 4 "$OUT/hero-phone.jpg"; rm -r "$T"
