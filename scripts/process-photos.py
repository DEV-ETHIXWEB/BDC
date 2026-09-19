"""Rebuild the site's photo masters from the full-frame originals (see src/data/photo-pages.ts).

Pipeline per photo: light denoise -> Real-ESRGAN x4plus (realesrgan-ncnn-vulkan) -> blend 82% super-resolved with
18% smooth resample (keeps faces and fish scales natural) -> Lanczos down to at most 2400px -> unified colour grade -> WebP.
Usage: python scripts/process-photos.py <originals.json> <out_dir> <realesrgan_dir>
originals.json: [{"file": "path.png", "name": "steelhead-riverbank"}, ...]
"""
import json, os, subprocess, sys
import cv2, numpy as np
from PIL import Image

def lum(a): return (a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114)[..., None]

def grade(im):
    a = np.array(im.convert('RGB'), dtype=np.float32) / 255
    l = lum(a)
    sh = np.clip(1 - l * 2, 0, 1) ** 1.5; hi = np.clip(l * 2 - 1, 0, 1) ** 1.5
    a = a + sh * np.array([-.010, .002, .016], np.float32) + hi * np.array([.014, .006, -.012], np.float32)
    a = np.clip(a, 0, 1); a = a * .94 + .06 * (a * a * (3 - 2 * a))
    l2 = lum(a); a = l2 + (a - l2) * .97
    return Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8))

def main(spec, out, rg):
    os.makedirs(out, exist_ok=True); tmp = os.path.join(out, '_tmp'); os.makedirs(tmp, exist_ok=True)
    for it in json.load(open(spec)):
        im = Image.open(it['file']).convert('RGB')
        a = cv2.fastNlMeansDenoisingColored(cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR), None, 3, 3, 5, 15)
        den = os.path.join(tmp, it['name'] + '_in.png'); cv2.imwrite(den, a)
        x4 = os.path.join(tmp, it['name'] + '_x4.png')
        subprocess.run([os.path.join(rg, 'realesrgan-ncnn-vulkan'), '-i', den, '-o', x4, '-n', 'realesrgan-x4plus', '-s', '4'], cwd=rg, check=True, capture_output=True)
        sr = Image.open(x4).convert('RGB')
        smooth = Image.open(den).convert('RGB').resize(sr.size, Image.BICUBIC)
        out_im = Image.blend(sr, smooth, 0.18)
        if max(out_im.size) > 2400: out_im.thumbnail((2400, 2400), Image.LANCZOS)
        out_im = grade(out_im)
        out_im.save(os.path.join(out, it['name'] + '.webp'), quality=90, method=6)
        print(f"{it['name']:22} {im.size} -> {out_im.size}", flush=True)
    for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)

if __name__ == '__main__': main(*sys.argv[1:4])
