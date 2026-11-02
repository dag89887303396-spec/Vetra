# Codex: video sound design toolchain

Installs, for the **Codex CLI**, three tools plus one skill that combines them:

| piece | installed to | what it does |
|---|---|---|
| [real-sfx](https://github.com/Clipwing/skills/tree/main/skills/real-sfx) skill (MIT, uisfx CC0) | `~/.agents/skills/real-sfx` | finds moments in the picture, picks real recordings, mixes them frame-accurately; keeps voice/music; copies the video stream |
| [Openverse API](https://api.openverse.org/v1/) | `~/.agents/skills/video-sound-design/scripts/openverse_sfx.py` | searches CC0/PDM/CC BY sound effects, checks each licence twice, downloads into a real-sfx library with `catalog.json`, writes credits |
| [Earshot](https://github.com/Leonxlnx/earshot) 0.4.0 (MIT; CLAP Apache-2.0, AST BSD-3) | `~/.codex/tools/earshot` + MCP server `earshot` in `~/.codex/config.toml` + skill `~/.agents/skills/earshot` | lets the agent "listen": describe, match, rank, find, timeline, sheet, critique |
| **video-sound-design** skill | `~/.agents/skills/video-sound-design` | the workflow: check → look → moments → Openverse sounds → mix → verify (real-sfx critique, Earshot, `qa.py`) → licence credits |

```bash
bash tools/codex-sound-design/install.sh            # never removes or overwrites existing skills
bash ~/.agents/skills/video-sound-design/scripts/doctor.sh
```
Then restart Codex and ask: *"озвучь это видео: ~/Videos/promo.mp4"* or `$video-sound-design`.

Requirements: Python ≥ 3.10, FFmpeg/ffprobe (with `drawtext`, `rubberband`), Node.js (Codex CLI, uisfx), ~4 GB disk
(CPU torch + models ~1.1 GB). Optional `OPENVERSE_TOKEN` for higher Openverse rate limits (anonymous: 20/min, 200/day).

Test report from installation: [TEST_REPORT.md](TEST_REPORT.md).
