# Install / repair (Codex CLI)

Codex reads user skills from `~/.agents/skills/<name>/SKILL.md` (official location; restart Codex after changes) and
MCP servers from `~/.codex/config.toml`.

| piece | location | source |
|---|---|---|
| real-sfx skill | `~/.agents/skills/real-sfx` | https://github.com/Clipwing/skills/tree/main/skills/real-sfx (MIT; uisfx CC0) |
| earshot skill (listening guide) | `~/.agents/skills/earshot` | https://github.com/Leonxlnx/earshot `skills/earshot` (MIT) |
| earshot package + venv + models | `~/.codex/tools/earshot` (`.venv`, `.cache/hf`) | same repo, `pip install -e ".[mcp]"`, CPU torch |
| Openverse library | `~/.agents/sfx-library/openverse` | `scripts/openverse_sfx.py` |
| this skill | `~/.agents/skills/video-sound-design` | |

Requirements: Python ≥ 3.10 (earshot), FFmpeg + ffprobe with `drawtext`, `rubberband`, `loudnorm`, `ebur128`,
`sidechaincompress` (macOS: `brew install ffmpeg-full`), Node.js only for the uisfx package, ~4 GB disk for torch +
models (CLAP `laion/larger_clap_general` @16c8cc3, AST `MIT/ast-finetuned-audioset-10-10-0.4593` @f826b80, ~1.1 GB),
YAMNet ONNX for real-sfx (`listen.py install --yes`, ~45 MB).

MCP entry (written by `codex mcp add earshot ...`):
```toml
[mcp_servers.earshot]
command = "/home/USER/.codex/tools/earshot/.venv/bin/python"
args = ["-m", "earshot", "mcp"]
startup_timeout_sec = 60
tool_timeout_sec = 600

[mcp_servers.earshot.env]
EARSHOT_HOME = "/home/USER/.codex/tools/earshot/.cache"
EARSHOT_OFFLINE = "1"      # models are cached; never contact the Hub at run time
EARSHOT_THREADS = "3"
```

The installer (`install.sh` in the repo that ships this skill) never deletes or overwrites an existing skill folder:
it skips a folder that exists (use `--update` to refresh real-sfx/earshot code while keeping `config.json`,
`library_index.json`, `taste.json`, `styles/` and `vendor/`).

Check everything: `bash ~/.agents/skills/video-sound-design/scripts/doctor.sh`.
