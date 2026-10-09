#!/usr/bin/env python3
"""Gurugram sky for the Bento time tile.

24.0 s at 30 fps, one second per hour (hour h at t = h), 960x640.
Every frame is a pure function of the hour, drawn with numpy and piped to ffmpeg.
Also writes the four posters and sky-calm.json (per half hour: the average colour of the
text zones and the contrast of the scheduled type colour over them).

Usage: python3 sky.py <outDir> [--frames-only DIR]   (see render-all.sh)
"""
import json, subprocess, sys
import numpy as np
from PIL import Image

W, H, FPS, DUR = 960, 640, 30, 24.0
OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/bento/motion'

def hx(s):
    s = s.lstrip('#'); return np.array([int(s[i:i + 2], 16) for i in (0, 2, 4)], float)

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# Palette keyframes by hour: zenith, horizon left, horizon right, skyline, stars, moon.
# Ink type from 06:30 to 17:30, white otherwise, so the sky flips between dark and light
# in the 12 minutes before each switch (06:18 to 06:30, 17:18 to 17:30).
NIGHT = dict(z='#0A1030', hl='#1C2756', hr='#1C2756', s='#10173A', star=1, moon=1)
KEYS = [
    (0.0, NIGHT),
    (4.75, NIGHT),
    (5.5, dict(z='#17225A', hl='#2C2E62', hr='#7A5A86', s='#121838', star=.45, moon=0)),
    (6.3, dict(z='#2E3F80', hl='#4A3F78', hr='#E8A886', s='#151A3A', star=0, moon=0)),
    (6.5, dict(z='#8DB3F0', hl='#E6EDFA', hr='#F7E6D6', s='#C2CADA', star=0, moon=0)),
    (9.0, dict(z='#82ABEE', hl='#DFE8FA', hr='#E2EAFA', s='#BDC6D6', star=0, moon=0)),
    (12.5, dict(z='#7FA9EE', hl='#DCE7FA', hr='#DCE7FA', s='#BBC4D5', star=0, moon=0)),
    (16.0, dict(z='#84A9EA', hl='#E0E6F6', hr='#EEE4E2', s='#BDC4D3', star=0, moon=0)),
    (17.3, dict(z='#8AA8E2', hl='#E4E2F0', hr='#F6D8C2', s='#C0C3D0', star=0, moon=0)),
    (17.5, dict(z='#4B3F8F', hl='#5A4282', hr='#F0A07A', s='#22193E', star=0, moon=0)),
    (18.4, dict(z='#2E2868', hl='#3A2E6C', hr='#C86E66', s='#1A1434', star=.15, moon=0)),
    (19.0, dict(z='#121640', hl='#22265A', hr='#3A2E62', s='#151A3C', star=.6, moon=0)),
    (19.5, NIGHT),
    (24.0, NIGHT),
]

def palette(h):
    for (h0, a), (h1, b) in zip(KEYS, KEYS[1:]):
        if h0 <= h <= h1:
            f = 0 if h1 == h0 else (h - h0) / (h1 - h0)
            f = f * f * (3 - 2 * f)
            out = {}
            for k in a:
                out[k] = (hx(a[k]) * (1 - f) + hx(b[k]) * f) if isinstance(a[k], str) else a[k] * (1 - f) + b[k] * f
            return out
    raise ValueError(h)

# Static geometry
yy, xx = np.mgrid[0:H, 0:W].astype(float)
HOR = 0.78 * H                      # sky meets the skyline band
v = np.clip(yy / HOR, 0, 1) ** 1.55   # vertical mix toward the horizon colour
sx = smooth(0.30, 1.0, xx / W)        # horizon colour runs left (cool) to right (warm)

rng = np.random.default_rng(7)
# Skyline: plain rectangles, two depths, no landmarks. Back layer taller and closer to the sky colour.
def blocks(seed, hmin, hmax, wmin, wmax):
    r = np.random.default_rng(seed); x = -10; out = []
    while x < W + 10:
        w = int(r.integers(wmin, wmax)); h = int(r.uniform(hmin, hmax) * H)
        out.append((x, w, h)); x += w
    return out
back = np.zeros((H, W), bool); front = np.zeros((H, W), bool)
for x, w, h in blocks(3, .12, .22, 34, 90): back[H - h:, max(0, x):max(0, x + w)] = True
for x, w, h in blocks(11, .055, .13, 26, 70): front[H - h:, max(0, x):max(0, x + w)] = True
front[int(H * .955):, :] = True     # ground line so the band reads as one band
back &= ~front

# Stars: about 40, static, upper sky only, away from the bottom left text zone and the top left text line.
stars = []
while len(stars) < 40:
    x, y = rng.uniform(.03, .97) * W, rng.uniform(.05, .52) * H
    if x < .62 * W and y < .2 * H: continue
    if any((x - a) ** 2 + (y - b) ** 2 < 60 ** 2 for a, b, _, _ in stars): continue
    stars.append((x, y, rng.uniform(1.6, 2.8), rng.uniform(.45, .95)))
star_layer = np.zeros((H, W))
for x, y, r, a in stars:
    d = np.hypot(xx - x, yy - y); star_layer = np.maximum(star_layer, a * np.clip(r + .5 - d, 0, 1))

# Grain: static triangular dither (+-1 code value) so 8 bit gradients do not band. Stronger grain
# (2% peak to peak) costs about 3x the bytes at the same quality with 2 keyframes a second.
grain = (rng.random((H, W)) - rng.random((H, W))) * 1.0

SUN_R, MOON_R = 34.0, 22.0
def sun_pos(h):
    """06:30 at 12% width just above the text zone, 12:30 high at centre (below the top text line), 18:30 at 88% behind the skyline."""
    f = (h - 6.5) / 12.0
    if f < 0 or f > 1: return None
    x = (.12 + .76 * f) * W
    s = np.sin(np.pi * f)
    y0 = .47 if f < .5 else .99
    y = (.31 + (y0 - .31) * (1 - s)) * H
    a = smooth(6.5, 6.62, h) if f < .5 else 1.0
    return x, y, a

def moon_pos(h):
    """Rises 19:30 at 20% width, crosses high, sets about 05:00 at 70%; never below 51% height."""
    hh = h if h >= 12 else h + 24
    f = (hh - 19.5) / 9.5
    if f < 0 or f > 1.05: return None
    x = (.20 + .50 * f) * W
    y = (.27 + .17 * (1 - np.sin(np.pi * min(f, 1)))) * H
    a = smooth(19.5, 19.9, hh) * (1 - smooth(28.6, 29.2, hh))
    return x, y, a

def frame(h, grain_on=True):
    p = palette(h)
    hor = p['hl'][None, None] * (1 - sx[..., None]) + p['hr'][None, None] * sx[..., None]
    img = p['z'][None, None] * (1 - v[..., None]) + hor * v[..., None]
    if p['star'] > 0:
        img = img + (hx('#E9ECF5') - img) * (star_layer * p['star'])[..., None]
    m = moon_pos(h)
    if m and m[2] > 0:
        x, y, a = m
        d1 = np.hypot(xx - x, yy - y); d2 = np.hypot(xx - (x + 10), yy - (y - 6))
        cres = np.clip(MOON_R + .5 - d1, 0, 1) * np.clip(d2 - (MOON_R - 2) + .5, 0, 1)
        img = img + (hx('#E9ECF5') - img) * (cres * a)[..., None]
    s = sun_pos(h)
    if s and s[2] > 0:
        x, y, a = s
        d = np.hypot(xx - x, yy - y)
        disc = 1 - smooth(SUN_R - 4, SUN_R + 4, d)         # flat disc, soft 8 px edge, no halo
        low = smooth(.55, .95, y / H)                        # warms a little near the horizon
        col = hx('#FFE6A8') * (1 - low) + hx('#FFC98E') * low
        img = img + (col - img) * (disc * a)[..., None]
    backc = p['s'] * .72 + (p['hl'] * .5 + p['hr'] * .5) * .28
    img[back] = backc
    img[front] = p['s']
    if grain_on: img = img + grain[..., None]
    return np.clip(np.round(img), 0, 255).astype(np.uint8)

# ---- contrast helpers for sky-calm.json
def lum(rgb):
    c = rgb / 255.0
    c = np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)
    return c[..., 0] * .2126 + c[..., 1] * .7152 + c[..., 2] * .0722
INK, WHITE = lum(hx('#11131C')), 1.0
def cr(a, b): hi, lo = max(a, b), min(a, b); return (hi + .05) / (lo + .05)

def zone_stats(img, sl, ink):
    z = img[sl].reshape(-1, 3).astype(float)
    L = lum(z)
    t = INK if ink else WHITE
    c = (np.maximum(L, t) + .05) / (np.minimum(L, t) + .05)
    avg = z.mean(0)
    return '#%02X%02X%02X' % tuple(int(round(q)) for q in avg), round(cr(lum(avg), t), 2), round(float(np.percentile(c, 5)), 2)

def main():
    frames_dir = sys.argv[3] if len(sys.argv) > 3 and sys.argv[2] == '--frames-only' else None
    if frames_dir is None:
        enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
            '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
            '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryslow', '-crf', '27',
            '-g', '15', '-keyint_min', '15', '-sc_threshold', '0', '-x264-params', 'aq-mode=3:deblock=-1,-1',
            '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
            '-movflags', '+faststart', '-an', f'{OUT}/sky.mp4'], stdin=subprocess.PIPE)
        enc9 = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
            '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
            '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-g', '15', '-keyint_min', '15',
            '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv', '-an', f'{OUT}/sky.webm'], stdin=subprocess.PIPE)
    n = int(DUR * FPS)
    for i in range(n):
        f = frame(i / FPS).tobytes()
        if frames_dir: Image.frombytes('RGB', (W, H), f).save(f'{frames_dir}/{i:04d}.png')
        else: enc.stdin.write(f); enc9.stdin.write(f)
    if frames_dir: return
    enc.stdin.close(); enc9.stdin.close(); enc.wait(); enc9.wait()

    for name, h in (('night', 0.0), ('dawn', 6.0), ('day', 12.0), ('dusk', 18.0)):
        Image.fromarray(frame(h)).save(f'{OUT}/sky-{name}.jpg', quality=84, optimize=True, progressive=True)

    # Zones in video pixels. bottom: the bottom left 55% x 45% (Gurugram and the live time).
    # top: the top 30% of the part a tile shows (object-fit cover, left bottom), for the availability line.
    bottom = (slice(int(H * .55), H), slice(0, int(W * .55)))
    top = (slice(0, int(H * .30)), slice(0, int(W * .85)))
    rows = []
    for k in range(48):
        h = k / 2
        ink = 6.5 <= h < 17.5
        img = frame(h, grain_on=False)
        bc, bavg, bmin = zone_stats(img, bottom, ink)
        tc, tavg, tmin = zone_stats(img, top, ink)
        rows.append(dict(time=f'{int(h):02d}:{"30" if k % 2 else "00"}', t=h, type='ink' if ink else 'white',
                         text=bc, textContrast=bavg, textContrastP5=bmin, top=tc, topContrast=tavg, topContrastP5=tmin))
    meta = dict(
        video='/bento/motion/sky.mp4', secondsPerHour=1, duration=24,
        typeColours=dict(ink='#11131C', white='#FFFFFF', ink_from='06:30', white_from='17:30'),
        posters=[dict(src='/bento/motion/sky-night.jpg', fromHour=19, toHour=5), dict(src='/bento/motion/sky-dawn.jpg', fromHour=5, toHour=6.5),
                 dict(src='/bento/motion/sky-day.jpg', fromHour=6.5, toHour=17.5), dict(src='/bento/motion/sky-dusk.jpg', fromHour=17.5, toHour=19)],
        zones=dict(text='bottom left 55% wide x 45% tall of the video frame', top='top 30% x left 85% of the video frame'),
        note='text and top are average colours of each zone at that half hour (grain off). *Contrast is the scheduled type colour against that average; *ContrastP5 is the 5th percentile over every pixel of the zone. The sky flips between dark and light in the 12 minutes before 06:30 and 17:30.',
        halfHours=rows)
    with open(f'{OUT}/sky-calm.json', 'w') as fh: json.dump(meta, fh, indent=1)
    for r in rows: print(r['time'], r['type'], r['text'], r['textContrast'], r['textContrastP5'], r['top'], r['topContrast'], r['topContrastP5'])

if __name__ == '__main__':
    main()
