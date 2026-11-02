#!/usr/bin/env bash
# Install real-sfx + Earshot (MCP) + Openverse fetcher + the video-sound-design skill for Codex CLI.
# Safe: never deletes or overwrites an existing skill. --update refreshes real-sfx/earshot code but keeps their
# config.json, library_index.json, taste.json, styles/, vendor/ and the earshot model cache.
#
#   bash tools/codex-sound-design/install.sh [--update] [--no-models]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SKILLS="${AGENTS_SKILLS:-$HOME/.agents/skills}"
TOOLS="$HOME/.codex/tools"
EARSHOT="$TOOLS/earshot"
REALSFX_REPO="https://github.com/Clipwing/skills.git"
EARSHOT_REPO="https://github.com/Leonxlnx/earshot.git"
EARSHOT_REF="${EARSHOT_REF:-v0.4.0}"
UPDATE=0; MODELS=1
for a in "$@"; do case "$a" in --update) UPDATE=1;; --no-models) MODELS=0;; *) echo "unknown option $a"; exit 2;; esac; done

need() { command -v "$1" >/dev/null || { echo "MISSING: $1 ($2)"; exit 1; }; }
need python3 "Python >= 3.10"; need ffmpeg "FFmpeg"; need ffprobe "FFmpeg"; need git "git"
python3 -c 'import sys; sys.exit(sys.version_info < (3,10))' || { echo "Python >= 3.10 needed"; exit 1; }
command -v codex >/dev/null || { need npm "Node.js, for Codex CLI"; npm i -g @openai/codex; }

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$SKILLS" "$TOOLS"

copy_skill() {  # src name
  local src="$1" dst="$SKILLS/$2"
  if [ ! -e "$dst" ]; then cp -r "$src" "$dst"; echo "installed skill $2"
  elif [ $UPDATE = 1 ]; then
    tar -C "$src" --exclude ./config.json --exclude ./library_index.json --exclude ./taste.json \
        --exclude ./styles --exclude ./vendor -cf - . | tar -C "$dst" -xf -
    echo "updated skill $2 (kept local config/data)"
  else echo "skill $2 exists, left untouched"; fi
}

# 1. real-sfx
git clone -q --depth 1 "$REALSFX_REPO" "$TMP/clipwing"
copy_skill "$TMP/clipwing/skills/real-sfx" real-sfx
( cd "$SKILLS/real-sfx"
  [ -f library_index.json ] || python3 scripts/setup.py init --uisfx --index --force >/dev/null || true
  [ -f vendor/models/yamnet.onnx ] || python3 scripts/listen.py install --yes )

# 2. earshot (package, venv, models, MCP, its listening skill)
if [ ! -d "$EARSHOT" ]; then git clone -q --depth 1 --branch "$EARSHOT_REF" "$EARSHOT_REPO" "$EARSHOT" \
   || git clone -q --depth 1 "$EARSHOT_REPO" "$EARSHOT"
elif [ $UPDATE = 1 ]; then git -C "$EARSHOT" pull -q --ff-only || true; fi
[ -x "$EARSHOT/.venv/bin/python" ] || python3 -m venv "$EARSHOT/.venv"
"$EARSHOT/.venv/bin/python" -m pip install -q --upgrade pip
"$EARSHOT/.venv/bin/python" -m pip install -q torch --index-url https://download.pytorch.org/whl/cpu
"$EARSHOT/.venv/bin/python" -m pip install -q -e "$EARSHOT[mcp]"
[ $MODELS = 1 ] && EARSHOT_HOME="$EARSHOT/.cache" "$EARSHOT/.venv/bin/python" -m earshot doctor --fetch | tail -1
copy_skill "$EARSHOT/skills/earshot" earshot
if ! codex mcp list 2>/dev/null | grep -q '^earshot '; then
  codex mcp add earshot --env EARSHOT_THREADS=3 --env EARSHOT_HOME="$EARSHOT/.cache" --env EARSHOT_OFFLINE=1 \
    -- "$EARSHOT/.venv/bin/python" -m earshot mcp
  python3 - "$HOME/.codex/config.toml" <<'EOF'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
key = 'args = ["-m", "earshot", "mcp"]\n'
if key in t and "startup_timeout_sec" not in t.split("[mcp_servers.earshot]")[1].split("[")[0]:
    t = t.replace(key, key + "startup_timeout_sec = 60\ntool_timeout_sec = 600\n", 1); p.write_text(t)
EOF
fi

# 3. video-sound-design (this repo) + Openverse library folder
copy_skill "$HERE/video-sound-design" video-sound-design
chmod +x "$SKILLS/video-sound-design/scripts/"* || true
mkdir -p "$HOME/.agents/sfx-library/openverse"

bash "$SKILLS/video-sound-design/scripts/doctor.sh"
echo "Restart Codex to load the skills. Fill the library: python3 $SKILLS/video-sound-design/scripts/openverse_sfx.py plan ..."
