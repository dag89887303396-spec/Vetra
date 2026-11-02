#!/usr/bin/env python3
"""Check that sound design kept the picture, the voice and the music, and measure the result.

  qa.py ORIGINAL.mp4 RESULT.mp4 --resolved RESULT_resolved_cues.json [--json out.json]

1. Video: same codec / size / fps / frame count, and the video packets are bit-identical (real-sfx copies the stream).
2. Base audio kept: RESULT audio minus the SFX layer (at its level in the mix) is compared with the ORIGINAL audio:
   correlation and level difference over the whole film and in the voice band (300-3400 Hz). Correlation >= 0.9 means
   the music and voice are the original's (ducking under hits lowers it a little; a rebuilt base without baked synth
   lowers it on purpose).
3. Loudness: integrated LUFS, true peak, LRA of both.
Exit 1 if the picture changed or the base audio was lost.
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys

import numpy as np

SR = 16000


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries",
                        "stream=codec_name,width,height,r_frame_rate,nb_read_packets,pix_fmt,bit_rate",
                        "-of", "json", path], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)["streams"][0]


def video_hash(path):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-map", "0:v:0", "-c", "copy", "-f", "md5", "-"],
                       capture_output=True, text=True)
    return r.stdout.strip()


def pcm(path, band=None):
    af = ["-af", f"highpass=f={band[0]},lowpass=f={band[1]}"] if band else []
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vn", *af, "-ac", "1", "-ar", str(SR), "-f", "f32le",
                        "-"], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)


def loud(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", "ebur128=peak=true", "-f",
                        "null", "-"], capture_output=True, text=True)
    tail = r.stderr[r.stderr.rfind("Summary:"):]
    g = lambda k: float(re.search(k + r":\s+(-?[\d.]+|-inf)", tail).group(1).replace("-inf", "-200"))
    return {"lufs": g("I"), "lra": g("LRA"), "true_peak_db": g("Peak")}


def compare(orig, rest):
    n = min(len(orig), len(rest))
    a, b = orig[:n].astype(np.float64), rest[:n].astype(np.float64)
    if np.std(a) < 1e-6:
        return {"corr": None, "level_diff_db": None}
    corr = float(np.corrcoef(a, b)[0, 1])
    lvl = 20 * np.log10((np.sqrt(np.mean(b ** 2)) + 1e-12) / (np.sqrt(np.mean(a ** 2)) + 1e-12))
    return {"corr": round(corr, 3), "level_diff_db": round(float(lvl), 2)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("original")
    ap.add_argument("result")
    ap.add_argument("--sfx-in-mix", help="the SFX layer at its level in the mix (default: taken from --resolved)")
    ap.add_argument("--resolved", help="<stem>_resolved_cues.json of real-sfx mix.py: finds the SFX layer itself")
    ap.add_argument("--json")
    a = ap.parse_args()
    out, ok = {}, True
    if a.resolved and not a.sfx_in_mix:
        from pathlib import Path
        d = json.loads(Path(a.resolved).read_text(encoding="utf-8"))
        stem = str(Path(a.resolved)).removesuffix("_resolved_cues.json")
        a.sfx_in_mix = d.get("sfx_track_in_mix_level") or d.get("sfx_ducked") or f"{stem}_sfx_track.wav"
        print(f"sfx     layer in the mix: {a.sfx_in_mix}")

    po, pr = probe(a.original), probe(a.result)
    same_fmt = all(po.get(k) == pr.get(k) for k in ("codec_name", "width", "height", "r_frame_rate", "pix_fmt",
                                                    "nb_read_packets"))
    ho, hr = video_hash(a.original), video_hash(a.result)
    out["video"] = {"original": po, "result": pr, "same_format": same_fmt, "bit_identical": ho == hr}
    print(f"video   {'OK  bit-identical stream' if ho == hr else ('same format, RE-ENCODED' if same_fmt else 'CHANGED')}"
          f"  {pr['codec_name']} {pr['width']}x{pr['height']} {pr['r_frame_rate']} frames={pr['nb_read_packets']}")
    ok &= same_fmt

    if a.sfx_in_mix:
        for name, band in (("full", None), ("voice band", (300, 3400))):
            o, r, s = pcm(a.original, band), pcm(a.result, band), pcm(a.sfx_in_mix, band)
            n = min(len(r), len(s))
            rest = r[:n] - s[:n]
            c = compare(o, rest)
            out[f"base_{name.replace(' ', '_')}"] = c
            flag = "OK " if c["corr"] is not None and c["corr"] >= 0.9 else "LOW"
            print(f"base    {flag} {name:10s} corr {c['corr']}  level {c['level_diff_db']:+.2f} dB "
                  f"(result minus SFX layer vs original)")
            if name == "full" and (c["corr"] is None or c["corr"] < 0.6):
                ok = False
    lo, lr = loud(a.original), loud(a.result)
    out["loudness"] = {"original": lo, "result": lr}
    print(f"loud    original {lo['lufs']:.1f} LUFS TP {lo['true_peak_db']:.1f} dBTP | result {lr['lufs']:.1f} LUFS "
          f"TP {lr['true_peak_db']:.1f} dBTP LRA {lr['lra']:.1f}")
    if lr["true_peak_db"] > -0.5:
        print("WARN    true peak above -0.5 dBTP")
    out["ok"] = bool(ok)
    print("RESULT  " + ("PASS" if ok else "FAIL"))
    if a.json:
        open(a.json, "w").write(json.dumps(out, indent=1))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
