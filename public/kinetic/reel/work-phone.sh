#!/bin/bash
# Work card loops on phones (Vishal 2026-10-13: "cut the loop from the video that was made for mobile"): cut from his own vertical 9:16 showreels,
# whole frame kept (his words on top, the screen below), 720x1280. DL = his ~/Downloads.
set -e; cd "$(dirname "$0")"
DL=${DL:-/mnt/user-data/uploads/Downloads}
enc(){ ffmpeg -v error -y "${@:1:$#-1}" -an -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart "${@: -1}"; }
V="scale=720:1280:flags=lanczos,fps=30,setsar=1"
# ixigo: "One hub. Six states." with the hub moving through its states
enc -ss 46 -t 8 -i "$DL/ixigo-case-study-teaser-90s-vertical.mp4" -vf "$V,fade=in:0:9,fade=out:st=7.7:d=0.3" ../../reel/ixigo-phone.mp4
# Split: "One split, four states."
enc -ss 48.5 -t 14.5 -i "$DL/Split-and-Request-Final/02b-split-showreel-9x16-mobile.mp4" -vf "$V,fade=in:0:9,fade=out:st=14.2:d=0.3" split-phone.mp4
# Twelve: "One number, every day." then "Tap the number, see why."
enc -ss 24 -t 10 -i "$DL/Twelve-Final/01-twelve-showreel-linkedin-9x16.mp4" -vf "$V,fade=in:0:9,fade=out:st=9.7:d=0.3" twelve-phone.mp4
# JARVIS: the 3:14 AM flood ("90 to 99%... And the real one gets missed."), then the flag and "Same car. No alert."
J="$DL/Staqu-Final/LinkedIn/01-staqu-showreel-linkedin-9x16.mp4"
enc -ss 5 -t 6.5 -i "$J" -ss 33 -t 7 -i "$J" -filter_complex "[0:v]$V[a];[1:v]$V[b];[a][b]xfade=transition=fade:duration=0.4:offset=6.1,fade=in:0:9,fade=out:st=12.8:d=0.3" jarvis-phone.mp4
ffmpeg -v error -y -ss 6.5 -i ../../reel/ixigo-phone.mp4 -frames:v 1 -q:v 3 ixigo-phone-lit.jpg
ffmpeg -v error -y -ss 6.5 -i ../../reel/ixigo-phone.mp4 -frames:v 1 -q:v 3 ../../reel/ixigo-phone.jpg
ffmpeg -v error -y -ss 12 -i split-phone.mp4 -frames:v 1 -q:v 3 split-phone.jpg
ffmpeg -v error -y -ss 4 -i twelve-phone.mp4 -frames:v 1 -q:v 3 twelve-phone.jpg
ffmpeg -v error -y -ss 3 -i jarvis-phone.mp4 -frames:v 1 -q:v 3 jarvis-phone.jpg
