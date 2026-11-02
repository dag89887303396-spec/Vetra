# Installation and real test report (2026-11-02)

Environment: Linux cloud container, Codex CLI 0.166.0, Python 3.13.18, FFmpeg 6.1.1 (drawtext, rubberband, loudnorm,
ebur128, sidechaincompress all present), Node 22, 4 CPU, no GPU.

## What was installed and checked

| item | result |
|---|---|
| Codex CLI | `@openai/codex` 0.166.0 (npm, global). Skills from `~/.agents/skills` (official user location). `codex debug prompt-input` lists `real-sfx`, `earshot` and `video-sound-design` in the model prompt |
| real-sfx | copied to `~/.agents/skills/real-sfx`, `setup.py init --uisfx --index`, YAMNet ONNX installed (`listen.py install --yes`, level-2 ears READY). `tests/selftest.py`: **188/189 passed**. The failed check is in the "unbake" path (subtracting a project's synthesized stem from a render), which this workflow doesn't use for ordinary videos |
| Earshot 0.4.0 | `~/.codex/tools/earshot`, own venv, CPU torch 2.15, `pip install -e .[mcp]`. Models fetched at pinned revisions (CLAP `laion/larger_clap_general` @16c8cc3, AST @f826b80), `earshot doctor --load`: no problems. Registered with `codex mcp add earshot` (+ `startup_timeout_sec`, `tool_timeout_sec`, `EARSHOT_OFFLINE=1`); a real stdio MCP client lists **16 tools** and ran `timeline`, `find`, `critique`, `sheet` |
| Openverse API | `openverse_sfx.py`: search with `license_type=commercial`, client-side licence policy, second licence check on the item's detail endpoint before download, `catalog.json` in real-sfx format + `LICENSES.json`, credits generator with `--strict` gate |
| Earshot listening gate | `listen_gate.py`: every download is heard (AudioSet + CLAP); speech / music is rejected |
| video-sound-design | `~/.agents/skills/video-sound-design` (SKILL.md, agents/openai.yaml with the earshot MCP dependency, doctor.sh, qa.py) |
| existing skills | none existed before; the installer never deletes or overwrites a skill folder |

## Real test

Input `test/test_promo.mp4` (9 s, 1280x720, 30 fps, H.264 + AAC): title fly-in, subtitle fade, wipe transition, a
moving bar, three word pops, slide transition, logo scale-up, URL fade, with a music pad and a Russian voice-over
(both synthetic stand-ins, built by `test/make_test_video.sh`).

Steps (as in SKILL.md): `look.py` + `find_moments.py --fine` (21 picture moments) -> typed event list from the frames
(`test/events.json`) -> Openverse fetch + licence audit + Earshot gate -> `find` locates the usable thunder clap
(4.60-7.67 s, z +4.4) -> cue sheet (`test/cues.json`) -> `mix.py --voice-safe` -> verify / critique / qa / credits /
Earshot.

| check | result |
|---|---|
| picture | **bit-identical video stream** (same md5 of packets, 270 frames, 1280x720 30 fps) |
| voice and music kept | result minus SFX layer vs original: **correlation 1.00**, level −0.05 dB (whole band and 300-3400 Hz) |
| loudness | original −18.9 LUFS / −0.8 dBTP -> result −18.8 LUFS / −1.4 dBTP (author's balance kept) |
| real-sfx verify | 11/11 sounds present, 0 off-frame, mono loss 0.0 dB, clean loop seam |
| real-sfx critique | sync 10, hook 9, pacing 10, hierarchy 10, headroom 10, speech 10, audibility 10, mono 10, low_end 8.5, balance 7, loudness 7, coverage 5.5, **variety 1.0** |
| Earshot timeline | 10 cues: median offset **4 ms**, 70 % within 40 ms (chance 42 %), 80 % within 100 ms; the two "without a hit" are reversed swells (soft onset by design) |
| Earshot critique | flags "code-synthesized" + "no music": correct about the TEST material (sine pad, espeak voice), which must be kept, not changed |
| licences | `credits --strict` passes: 1 × CC BY 3.0 (attribution in `test/CREDITS.md`), uisfx CC0; no NC/ND |

## Limits found (honest)

1. **Freesound's CDN (`cdn.freesound.org`) answers 403 to this cloud container** (any client), and Freesound holds
   almost all real SFX on Openverse. The fetcher reports these as skipped (`--exclude-provider freesound` saves the
   rate limit). On a normal desktop connection Freesound downloads are expected to work, but that wasn't tested here.
2. **Openverse was degraded during the test**: many uncached searches returned 504/500 or took 30-110 s;
   `mature=false` always hung. The fetcher retries with backoff; `VSD_TIMEOUT` sets the wait.
3. Wikimedia audio on Openverse is mostly music and word pronunciations (the only Wikimedia "whoosh" is a person saying
   the word). That is why the Earshot gate exists. Result: the test library had **one** usable recording (Thunder, CC BY),
   which is why real-sfx scored variety 1.0. All five non-UI sounds are slices of it (reversed swells for transitions,
   the clap for the logo hit). Fill the library on a machine that can reach Freesound to fix this.
4. Codex had no OpenAI login in the container, so the pipeline was run step by step from SKILL.md, not by a Codex agent.
   Skill discovery and the MCP server were verified separately.
5. Nobody listened: these are measurements. Listen at 0.92 s (hook), 4.40 s (quietest swell), 6.30-6.62 s (lifted
   swell into the loudest hit).
