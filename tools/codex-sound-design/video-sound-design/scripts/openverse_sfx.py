#!/usr/bin/env python3
"""Openverse (https://api.openverse.org/v1/) -> a licence-checked local SFX library for real-sfx.

  openverse_sfx.py search "whoosh" [--n 10] [--policy strict|attribution|sharealike] [--max-dur 6]
  openverse_sfx.py fetch  "whoosh" --type whoosh [--n 4] [--lib DIR] [--policy ...] [--max-dur 6]
  openverse_sfx.py plan   whoosh=whoosh,swoosh  impact=impact,thud  click="mouse click"  [--n 3] ...
  openverse_sfx.py credits RESOLVED_CUES.json [--lib DIR] [--out CREDITS.md] [--strict]
  openverse_sfx.py audit  [--lib DIR]

Licence policy (commercial use only, never NC / ND / Sampling+):
  strict       cc0, pdm                      (no attribution needed)          <- default
  attribution  cc0, pdm, by                  (credits REQUIRED in the video description / end card)
  sharealike   cc0, pdm, by, by-sa           (by-sa: the adapted SOUND must be shared under BY-SA; ask a human first)

Every downloaded file gets a row in <lib>/catalog.json (the real-sfx catalog format: file, type, source, hit,
hits_in_source) plus licence fields, and <lib>/LICENSES.json keeps the full Openverse record. The licence is checked
twice: in the search result and again on the item's detail endpoint just before download. A file whose licence is not
on the allowed list is never written.

`credits` reads the cue sheet real-sfx's mix.py resolved (every "file" in it), and writes the attribution block for
the sounds that were really used. --strict exits 2 if a used file has no commercial-safe licence record (files from
uisfx are CC0 and pass; files from other libraries are reported as "licence unknown: user's own library").

Auth (optional, higher rate limits): OPENVERSE_TOKEN env var (an OAuth2 client-credentials token). Anonymous limits
are 20 requests/min and 200/day. The API is called with a descriptive User-Agent, as Openverse asks.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://api.openverse.org/v1"
UA = "video-sound-design-skill/1.0 (Codex skill; Openverse audio search)"
DEFAULT_LIB = Path(os.environ.get("VSD_LIBRARY", Path.home() / ".agents" / "sfx-library" / "openverse"))
POLICIES = {
    "strict": {"cc0", "pdm"},
    "attribution": {"cc0", "pdm", "by"},
    "sharealike": {"cc0", "pdm", "by", "by-sa"},
}
NEVER = {"by-nc", "by-nd", "by-nc-sa", "by-nc-nd", "nc-sampling+", "sampling+"}
NEEDS_CREDIT = {"by", "by-sa"}
UISFX_HINT = "uisfx"


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def http_json(url, tries=3, timeout=None):
    timeout = timeout or float(os.environ.get("VSD_TIMEOUT", 40))
    hdr = {"User-Agent": UA, "Accept": "application/json"}
    if os.environ.get("OPENVERSE_TOKEN"):
        hdr["Authorization"] = f"Bearer {os.environ['OPENVERSE_TOKEN']}"
    delay = 2
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=hdr), timeout=timeout) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                log(f"openverse: rate limited (429). Anonymous limit is 20/min, 200/day; set OPENVERSE_TOKEN.")
                if i == tries - 1:
                    raise
            elif e.code < 500:
                raise
            log(f"openverse: HTTP {e.code}, retry in {delay}s")
        except (urllib.error.URLError, TimeoutError) as e:
            log(f"openverse: {e}, retry in {delay}s")
        time.sleep(delay)
        delay *= 2
    raise RuntimeError(f"Openverse did not answer: {url}")


def search(query, n=10, policy="strict", max_dur=8.0, min_dur=0.05, page_size=20, pages=2, exclude=(), source=None):
    """Search audio, keep only commercial-safe licences of the policy. Filtering is done client side: the API's own
    combined filters (source / category) time out often; `license_type=commercial` is passed when it answers."""
    allowed = POLICIES[policy]
    out, seen = [], set()
    for page in range(1, pages + 1):
        q = {"q": query, "page_size": page_size, "page": page, "license_type": "commercial"}
        if source:
            q["source"] = source          # server-side provider filter: slow (often 30-90 s) but saves pages
        # NB: never pass mature=false (mature is excluded by default): it makes the API hang
        try:
            d = http_json(f"{API}/audio/?{urllib.parse.urlencode(q)}")
        except Exception as e:
            log(f"openverse: search failed with license_type filter ({e}); retry with explicit licences")
            q.pop("license_type")
            q["license"] = ",".join(sorted(allowed))
            d = http_json(f"{API}/audio/?{urllib.parse.urlencode(q)}")
        for r in d.get("results", []):
            lic = (r.get("license") or "").lower()
            dur = (r.get("duration") or 0) / 1000.0
            if r.get("source") in exclude:
                continue
            if r["id"] in seen or lic in NEVER or lic not in allowed or r.get("mature"):
                continue
            if dur and not (min_dur <= dur <= max_dur):
                continue
            seen.add(r["id"])
            out.append(r)
        if len(out) >= n or page >= (d.get("page_count") or 1):
            break
    return out[:n]


def slug(s, k=48):
    s = re.sub(r"[^A-Za-z0-9]+", "_", s or "sound").strip("_").lower()
    return s[:k] or "sound"


def ffprobe_ok(path):
    try:
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                           capture_output=True, text=True, timeout=30)
        return float(r.stdout.strip() or 0) > 0.02
    except Exception:
        return False


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)


def load_rows(lib):
    p = lib / "catalog.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


def save_rows(lib, rows):
    (lib / "catalog.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")


def fetch(query, sfx_type, n, lib, policy, max_dur, exclude=(), source=None):
    lib.mkdir(parents=True, exist_ok=True)
    rows = load_rows(lib)
    have = {r["openverse_id"] for r in rows}
    rej = lib / "rejected.json"          # rejected by the Earshot listening gate: never download again
    if rej.exists():
        have |= {r["openverse_id"] for r in json.loads(rej.read_text(encoding="utf-8"))}
    full_p = lib / "LICENSES.json"
    full = json.loads(full_p.read_text(encoding="utf-8")) if full_p.exists() else {}
    got, skipped = [], []
    for r in search(query, n=n * 3, policy=policy, max_dur=max_dur, pages=3, exclude=exclude, source=source):
        if len(got) >= n:
            break
        if r["id"] in have:
            continue
        # second licence check, on the item itself, right before download
        try:
            det = http_json(r["detail_url"])
        except Exception as e:
            skipped.append((r["title"], f"detail check failed: {e}"))
            continue
        lic = (det.get("license") or "").lower()
        if lic != (r.get("license") or "").lower() or lic not in POLICIES[policy] or lic in NEVER:
            skipped.append((r["title"], f"licence changed or not allowed: {lic}"))
            continue
        urls = [det.get("url")] + [a.get("url") for a in (det.get("alt_files") or []) if a.get("url")]
        ext = (det.get("filetype") or Path(urllib.parse.urlparse(urls[0] or "").path).suffix.lstrip(".") or "mp3")
        rel = Path(sfx_type) / f"{slug(det.get('title'))}__{det['id'][:8]}.{ext.lower()}"
        dest = lib / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        ok, err = False, ""
        for u in [u for u in urls if u]:
            try:
                download(u, dest)
                if ffprobe_ok(dest):
                    ok = True
                    break
                err = "not decodable audio"
            except Exception as e:
                err = f"{type(e).__name__}: {e}"
        if not ok:
            dest.unlink(missing_ok=True)
            skipped.append((det.get("title"), f"download failed ({det.get('source')}): {err}"))
            continue
        row = {
            "file": rel.as_posix(), "type": sfx_type, "source": f"openverse/{det.get('source')}/{det.get('title')}",
            "hit": 1, "hits_in_source": 1,
            "openverse_id": det["id"], "title": det.get("title"), "creator": det.get("creator"),
            "license": lic, "license_version": det.get("license_version"), "license_url": det.get("license_url"),
            "attribution": det.get("attribution"), "landing_url": det.get("foreign_landing_url"),
            "provider": det.get("source"), "credit_required": lic in NEEDS_CREDIT,
            "share_alike": lic == "by-sa", "query": query, "fetched": time.strftime("%Y-%m-%d"),
        }
        rows.append(row)
        full[det["id"]] = det
        have.add(det["id"])
        got.append(row)
        print(f"  + {rel.as_posix():64s} {lic:6s} {det.get('creator') or '?'}", flush=True)
    save_rows(lib, rows)
    full_p.write_text(json.dumps(full, ensure_ascii=False, indent=1), encoding="utf-8")
    for t, why in skipped:
        print(f"  - skipped {str(t)[:50]!r}: {why}")
    return got, skipped


def lib_index(lib):
    return {str((lib / r["file"]).resolve()): r for r in load_rows(lib)}


def used_files(resolved):
    d = json.loads(Path(resolved).read_text(encoding="utf-8"))
    files = set()

    def walk(x):
        if isinstance(x, dict):
            # a slice / processed copy names its real source: credit the source, not the temp file
            src = x.get("slice_of") or x.get("_slice_of") or x.get("source_file")
            if isinstance(src, str):
                files.add(src)
            elif isinstance(x.get("file"), str):
                files.add(x["file"])
            for v in x.values():
                if isinstance(v, (dict, list)):
                    walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
    walk(d)
    return sorted(files)


def credits(resolved, lib, out, strict):
    idx = lib_index(lib)
    lines, bad, credit_rows, free_rows = [], [], [], []
    for f in used_files(resolved):
        p = str(Path(f).resolve())
        r = idx.get(p)
        if r:
            (credit_rows if r["credit_required"] else free_rows).append(r)
            if r["license"] not in POLICIES["sharealike"]:
                bad.append((f, r["license"]))
        elif UISFX_HINT in f.lower():
            free_rows.append({"title": Path(f).stem, "creator": "uisfx", "license": "cc0", "attribution": "uisfx (CC0)"})
        else:
            bad.append((f, "licence unknown: not from Openverse (user's own library? check its licence)"))
    uniq = lambda rs: list({(r.get("title"), r.get("creator")): r for r in rs}.values())
    lines.append("# Sound credits\n")
    if credit_rows:
        lines.append("## Attribution required (CC BY / BY-SA) - put this in the video description or end card\n")
        for r in uniq(credit_rows):
            lines.append(f"- {r['attribution']}  ({r['landing_url']})")
        lines.append("")
    if free_rows:
        lines.append("## No attribution required (CC0 / Public Domain Mark)\n")
        for r in uniq(free_rows):
            lines.append(f"- \"{r.get('title')}\" by {r.get('creator') or '?'} - {r['license'].upper()}"
                         + (f" ({r['landing_url']})" if r.get("landing_url") else ""))
        lines.append("")
    if any(r.get("share_alike") for r in credit_rows):
        lines.append("WARNING: a BY-SA sound is used: the adapted sound must be shared under CC BY-SA.\n")
    if bad:
        lines.append("## NOT VERIFIED\n")
        for f, why in bad:
            lines.append(f"- {f}: {why}")
    text = "\n".join(lines) + "\n"
    if out:
        Path(out).write_text(text, encoding="utf-8")
    print(text)
    if strict and bad:
        sys.exit(2)


def audit(lib):
    rows = load_rows(lib)
    bad = 0
    for r in rows:
        exists = (lib / r["file"]).is_file()
        ok = r["license"] in POLICIES["sharealike"] and r["license"] not in NEVER and exists
        bad += not ok
        print(f"{'ok ' if ok else 'BAD'} {r['license']:6s} {'credit' if r['credit_required'] else '      '} "
              f"{r['file']}{'' if exists else '  (file missing)'}")
    by = {}
    for r in rows:
        by[r["license"]] = by.get(r["license"], 0) + 1
    print(f"{len(rows)} sounds, licences: {by}, problems: {bad}")
    return bad == 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("search", "fetch", "plan"):
        s = sub.add_parser(name)
        if name == "plan":
            s.add_argument("specs", nargs="+", help="type=query1,query2 ...")
        else:
            s.add_argument("query")
        s.add_argument("--n", type=int, default=10 if name == "search" else 3)
        s.add_argument("--policy", choices=POLICIES, default="strict")
        s.add_argument("--max-dur", type=float, default=8.0)
        s.add_argument("--lib", type=Path, default=DEFAULT_LIB)
        s.add_argument("--json", action="store_true")
        s.add_argument("--exclude-provider", default=os.environ.get("VSD_EXCLUDE_PROVIDERS", ""),
                       help="comma list of Openverse sources to skip (e.g. freesound when its CDN is blocked)")
        s.add_argument("--source", default=os.environ.get("VSD_SOURCE") or None,
                       help="only this Openverse provider (freesound | wikimedia_audio | jamendo)")
        if name == "fetch":
            s.add_argument("--type", required=True, help="real-sfx pack type: whoosh impact riser pop chime ui click "
                                                          "typing camera paper glass foley water ambience glitch ...")
    c = sub.add_parser("credits")
    c.add_argument("resolved")
    c.add_argument("--lib", type=Path, default=DEFAULT_LIB)
    c.add_argument("--out")
    c.add_argument("--strict", action="store_true")
    a = sub.add_parser("audit")
    a.add_argument("--lib", type=Path, default=DEFAULT_LIB)
    args = ap.parse_args()
    ex = tuple(x.strip() for x in getattr(args, "exclude_provider", "").split(",") if x.strip())

    if args.cmd == "search":
        res = search(args.query, n=args.n, policy=args.policy, max_dur=args.max_dur, exclude=ex, source=args.source)
        if args.json:
            print(json.dumps(res, ensure_ascii=False, indent=1))
            return
        for r in res:
            print(f"{r['id'][:8]} {r['license']:6s} {(r.get('duration') or 0) / 1000:6.2f}s {r['source']:16s} "
                  f"{r['title'][:50]!r} by {r.get('creator')}")
        print(f"{len(res)} commercial-safe results (policy {args.policy})")
    elif args.cmd == "fetch":
        fetch(args.query, args.type, args.n, args.lib, args.policy, args.max_dur, ex, args.source)
    elif args.cmd == "plan":
        for spec in args.specs:
            t, _, qs = spec.partition("=")
            for q in [q for q in qs.split(",") if q.strip()] or [t]:
                print(f"[{t}] {q}")
                got, _ = fetch(q.strip(), t.strip(), args.n, args.lib, args.policy, args.max_dur, ex, args.source)
                time.sleep(3.2)   # stay under 20 requests a minute
    elif args.cmd == "credits":
        credits(args.resolved, args.lib, args.out, args.strict)
    elif args.cmd == "audit":
        sys.exit(0 if audit(args.lib) else 1)


if __name__ == "__main__":
    main()
