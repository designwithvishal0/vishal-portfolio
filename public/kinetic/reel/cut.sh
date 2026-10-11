#!/usr/bin/env bash
# Kinetic home page loops for Split and JARVIS (2026-10-11), cut from Vishal's showreels with public/reel/cut.sh's reel().
# The Twelve loop is not cut: tools/twelve-loop renders it from his Figma file.
# Usage: bash public/kinetic/reel/cut.sh
set -euo pipefail
cd "$(dirname "$0")"
eval "$(sed -n '/^FF=/,/^# 1\. Hero/p' ../../reel/cut.sh | sed '$d')"   # reuse FF, TMP, sources, crops, jpg() and reel()
# Split: "One split, four states". The four states build one by one, then "Four reasons to open the app".
reel split-scene 1280 720 22 0.5 1 "$SP 47.8 15.6 $FULL"
reel split-phone 720 900 22 0.5 1 "$SP 47.8 15.6 150:0:864:1080"
# JARVIS: the 3 AM flood (90 to 99% are false), one correction, then the payoff: same car, no alert.
reel jarvis-scene 1280 720 22 0.5 1 "$JV 5.8 3.8 $FULL" "$JV 33.8 2.6 $FULL" "$JV 37.5 2.4 $FULL"
reel jarvis-phone 720 900 22 0.5 1 "$JV 5.8 3.8 $JV_PHONE" "$JV 33.8 2.6 $JV_PHONE" "$JV 37.5 2.4 $JV_PHONE"
# Split posters show all four states (SP 60.5), not the empty first frame, like the ixigo "lit" posters
$FF -ss 60.5 -i "$SP" -frames:v 1 -vf scale=1280:720:flags=lanczos -q:v 3 split-scene.jpg
$FF -ss 60.5 -i "$SP" -frames:v 1 -vf "crop=864:1080:150:0,scale=720:900:flags=lanczos" -q:v 3 split-phone.jpg
