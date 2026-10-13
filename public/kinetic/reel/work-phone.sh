#!/bin/bash
# Work card phone loops (Vishal 2026-10-13: "use the same height for all of the project videos" and "cut from the videos where the context
# is understood"). Built from each scene cut, laid out like split-phone.mp4: the scene's own words on top, the phone below at one height (540 of 900).
set -e; cd "$(dirname "$0")"
BG="[0:v]crop=240:300:0:420,scale=720:900,boxblur=30:2[bg]"
FE="format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1,min(min(X,W-X),min(Y,H-Y))/28)'"
one(){ # src out text_crop phone_crop poster_time
  lay "$1" "$3" "$4" -r 30 -an -c:v libx264 -crf 24 -preset slow -movflags +faststart "$2.mp4"
  ffmpeg -v error -y -ss $5 -i "$2.mp4" -frames:v 1 -q:v 3 "$2.jpg"
}
lay(){ local i=$1 t=$2 ph=$3; shift 3
  ffmpeg -v error -y -i "$i" -filter_complex "$BG;[0:v]crop=$t,scale=672:250:force_original_aspect_ratio=decrease,$FE[t];[0:v]crop=$ph,scale=-2:540,$FE[p];[bg][t]overlay=24:40[x];[x][p]overlay=(W-w)/2:330,format=yuv420p" "$@"
}
one ../../reel/ixigo-scene.mp4 ../../reel/ixigo-phone 540:250:70:150 320:690:756:15 6.3
# ixigo poster: the lit still (chart failed state), laid out the same way
lay ixigo-scene-lit.jpg 540:250:70:150 320:690:756:15 -frames:v 1 -q:v 3 ixigo-phone-lit.jpg
one twelve-scene.mp4 twelve-phone 440:330:70:190 380:690:800:15 4.5
one jarvis-scene.mp4 jarvis-phone 560:300:60:190 330:690:688:15 2
