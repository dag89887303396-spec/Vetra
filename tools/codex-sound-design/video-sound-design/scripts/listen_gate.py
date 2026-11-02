#!/usr/bin/env python3
"""Earshot listening gate for the Openverse library: every new download is heard (CLAP + AudioSet, CPU) before
real-sfx may use it. Run with earshot's own Python (models load once for the whole batch):

  ~/.codex/tools/earshot/.venv/bin/python -I listen_gate.py [--lib DIR] [--recheck]

A file is REJECTED (moved to <lib>_rejected/, row kept with "rejected": reason) when AudioSet hears mostly speech or
music (Openverse titles lie: Wikimedia "whoosh" is often a person pronouncing the word). Every accepted row gets
"earshot": {summary, audioset top-3, match z / verdict for "a <type> sound effect"}.
"""
import argparse
import json
import os
import shutil
from pathlib import Path

os.environ.setdefault("EARSHOT_HOME", str(Path.home() / ".codex/tools/earshot/.cache"))
os.environ.setdefault("EARSHOT_OFFLINE", "1")
import earshot.api as es  # noqa: E402

LIB = Path(os.environ.get("VSD_LIBRARY", Path.home() / ".agents" / "sfx-library" / "openverse"))
SPEECH = {"speech", "narration, monologue", "male speech, man speaking", "female speech, woman speaking",
          "speech synthesizer", "conversation", "child speech, kid speaking"}
MUSIC = {"music", "singing", "musical instrument", "song", "orchestra", "pop music", "classical music"}
QUERY = {"whoosh": "a fast air whoosh swoosh", "impact": "a punchy impact hit", "riser": "a rising tension riser",
         "pop": "a short soft pop", "chime": "a bright bell chime ding", "click": "a short mechanical click",
         "typing": "keyboard typing key presses", "camera": "a camera shutter click", "glass": "a glass clink"}


def verdict(d):
    tags = [(t["label"].lower(), t["p"]) for t in d.get("audioset", [])]
    sp = max([p for l, p in tags if l in SPEECH] or [0])
    mu = max([p for l, p in tags if l in MUSIC] or [0])
    if sp >= 0.45:
        return f"speech (AudioSet {sp:.2f})"
    if mu >= 0.6 and not any(l == "sound effect" and p >= 0.2 for l, p in tags):
        return f"music (AudioSet {mu:.2f})"
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lib", type=Path, default=LIB)
    ap.add_argument("--recheck", action="store_true")
    a = ap.parse_args()
    cat = a.lib / "catalog.json"
    rows = json.loads(cat.read_text(encoding="utf-8")) if cat.exists() else []
    rej_dir = a.lib.parent / (a.lib.name + "_rejected")
    for r in rows:
        if r.get("rejected") or ("earshot" in r and not a.recheck):
            continue
        p = a.lib / r["file"]
        if not p.exists():
            continue
        d = es.describe(str(p))
        why = verdict(d)
        q = QUERY.get(r["type"], f"a {r['type']} sound effect")
        m = es.match(str(p), q)
        r["earshot"] = {"summary": d.get("summary", "")[:300],
                        "audioset": [(t["label"], round(t["p"], 2)) for t in d.get("audioset", [])[:3]],
                        "match_query": q, "match_z": m.get("z"), "match_verdict": m.get("verdict")}
        if why:
            r["rejected"] = why
            dst = rej_dir / r["file"]
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(p), dst)
            print(f"REJECT {r['file']}: {why}")
        else:
            print(f"ok     {r['file']}: match {m.get('verdict')} (z {m.get('z')}) | {r['earshot']['audioset']}")
        cat.write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    # real-sfx reads catalog rows by file; drop rejected ones from the catalog it sees, keep them in a log
    keep = [r for r in rows if not r.get("rejected")]
    gone = [r for r in rows if r.get("rejected")]
    cat.write_text(json.dumps(keep, ensure_ascii=False, indent=1), encoding="utf-8")
    if gone:
        log = a.lib / "rejected.json"
        old = json.loads(log.read_text(encoding="utf-8")) if log.exists() else []
        log.write_text(json.dumps(old + gone, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(keep)} accepted, {len(gone)} rejected this run")


if __name__ == "__main__":
    main()
