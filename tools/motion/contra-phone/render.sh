#!/bin/bash
# Phone hero reel (Vishal 2026-10-13, "remake the full reel from scratch"): his Contra showreel rebuilt natively for a 4:5 phone frame.
# CLIPS = his ~/Downloads/_showreel_work/clips (the same product clips the Contra reel was made from).
set -e; cd "$(dirname "$0")"
CLIPS=${CLIPS:-/mnt/user-data/uploads/Downloads/_showreel_work/clips}
for n in bbb_phone pdp_phone pwl_phone ixigo_phone reward_phone twelve_phone bbb_hero; do
  mkdir -p frames/$n; ffmpeg -v error -y -i "$CLIPS/$n.mp4" -vf fps=30 -q:v 2 frames/$n/%03d.jpg
done
R=../../../public/kinetic/reel
node render.mjs $R/hero-phone.mp4
ffmpeg -v error -y -ss 15.8 -i $R/hero-phone.mp4 -frames:v 1 -q:v 3 $R/hero-phone.jpg
