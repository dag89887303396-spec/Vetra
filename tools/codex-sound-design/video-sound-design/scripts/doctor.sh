#!/usr/bin/env bash
# Health check for the video-sound-design toolchain: Python, FFmpeg (+filters), real-sfx, Openverse, Earshot (models + MCP).
SK="${AGENTS_SKILLS:-$HOME/.agents/skills}"
EARSHOT="${EARSHOT_DIR:-$HOME/.codex/tools/earshot}"
ok=1
say() { printf '%-10s %s\n' "$1" "$2"; }

PYV=$(python3 -c 'import sys;print("%d.%d"%sys.version_info[:2])' 2>/dev/null)
if python3 -c 'import sys;sys.exit(sys.version_info<(3,10))' 2>/dev/null; then say python "ok $PYV"; else say python "NEED >=3.10 (have ${PYV:-none})"; ok=0; fi
if command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null; then
  say ffmpeg "ok $(ffmpeg -version | head -1 | cut -d' ' -f3)"
  for f in drawtext rubberband loudnorm ebur128 sidechaincompress; do
    ffmpeg -hide_banner -filters 2>/dev/null | grep -qw "$f" && say "  filter" "ok $f" || say "  filter" "missing $f (real-sfx frame sheets / pitch shifts degrade)"
  done
else say ffmpeg "MISSING (install FFmpeg with ffprobe)"; ok=0; fi

if [ -f "$SK/real-sfx/SKILL.md" ]; then
  say real-sfx "installed $SK/real-sfx"
  (cd "$SK/real-sfx" && python3 scripts/setup.py check | sed 's/^/           /') || true
  (cd "$SK/real-sfx" && python3 scripts/listen.py status 2>/dev/null | grep -i "level 2" | sed 's/^/           /')
else say real-sfx "MISSING"; ok=0; fi

code=$(curl -sS -m 20 -o /dev/null -w '%{http_code}' 'https://api.openverse.org/v1/audio/?q=whoosh&page_size=1' 2>/dev/null)
[ "$code" = 200 ] && say openverse "ok (api.openverse.org reachable${OPENVERSE_TOKEN:+, token set})" || { say openverse "UNREACHABLE (HTTP $code)"; ok=0; }
LIB="${VSD_LIBRARY:-$HOME/.agents/sfx-library/openverse}"
[ -f "$LIB/catalog.json" ] && say library "$(python3 -c "import json;r=json.load(open('$LIB/catalog.json'));print(len(r),'Openverse sounds in $LIB')")" || say library "empty ($LIB) -> openverse_sfx.py plan ..."

if [ -x "$EARSHOT/.venv/bin/python" ]; then
  out=$(EARSHOT_HOME="$EARSHOT/.cache" "$EARSHOT/.venv/bin/python" -m earshot doctor 2>&1)
  echo "$out" | grep -q '"laion/larger_clap_general": true' && say earshot "ok, models cached ($EARSHOT/.cache)" || { say earshot "models NOT cached -> earshot doctor --fetch"; ok=0; }
else say earshot "MISSING ($EARSHOT)"; ok=0; fi
if command -v codex >/dev/null; then
  codex mcp list 2>/dev/null | grep -q '^earshot ' && say codex-mcp "ok earshot registered ($(codex --version))" || { say codex-mcp "earshot NOT registered"; ok=0; }
else say codex "not on PATH (MCP config still in ~/.codex/config.toml)"; fi
[ $ok = 1 ] && echo "ALL OK" || { echo "PROBLEMS FOUND"; exit 1; }
