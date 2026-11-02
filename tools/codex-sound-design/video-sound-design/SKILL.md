---
name: video-sound-design
description: Automatic sound design for finished videos, motion graphics, kinetic-typography / text animations, transitions, logo reveals, UI/screen recordings and object movement, using REAL commercially-licensed recordings. Orchestrates real-sfx (moment finding, sound choice, frame-accurate mix that keeps voice, music and the video stream untouched), Openverse API (search + licence-checked download of CC0 / PDM / CC BY sound effects) and Earshot via MCP (listening: describe, match, timeline, critique). Use when the user asks to add SFX / sound effects / sound design to a video, "озвучь видео", "добавь звуки", "саунд-дизайн", whooshes on transitions, typing sounds on text, hits on cuts, UI clicks, or to find commercially-safe sound effects. Not for composing music, voice-over/TTS, or cleaning dialogue noise.
---

# video-sound-design

One pipeline from a silent-ish edit to a sound-designed MP4, built from three tools that stay installed separately:

| tool | where | role here |
|---|---|---|
| **real-sfx** skill | `~/.agents/skills/real-sfx` | the engine: finds moments, picks real sounds, places them on the frame, mixes (video stream copied, voice/music kept), self-critique |
| **Openverse API** | `scripts/openverse_sfx.py` | fills a local library with commercially-usable recordings, checks every licence twice, writes a real-sfx `catalog.json` and credits |
| **Earshot** (MCP server `earshot`) | `~/.codex/tools/earshot` | ears: `describe`, `match`, `rank`, `find`, `timeline`, `sheet`, `critique` of sounds and of the finished film |

`S=~/.agents/skills/video-sound-design/scripts`, `R=~/.agents/skills/real-sfx` below. Run real-sfx scripts **from `$R`**
(`cd $R`). Put all working files in a work folder next to the video (`work/`, `result/`), never inside the skill folders
or the user's project.

## Hard rules

1. **Keep the original.** Never re-encode the picture: real-sfx `mix.py` copies the video stream; `qa.py` must say
   `bit-identical stream`. Voice and music stay in the mix: `--voice-safe` when there is speech, `--duck` only when music
   leads and the user agrees. Never drop the original audio unless the user asks.
2. **Commercial licences only.** Sounds come from (a) Openverse with licence `cc0` / `pdm` (no credit) or `by` (credit
   REQUIRED), (b) uisfx (CC0, bundled in real-sfx), (c) the user's own libraries (their licence is the user's
   responsibility: say so). Never NC, ND or Sampling+. `by-sa` only with `--policy sharealike` after asking the user.
   Before delivering run `openverse_sfx.py credits ... --strict` and hand over `CREDITS.md`.
3. **Real recordings, not synthesis** (real-sfx rule). Earshot `sfx render` / `forge` sounds are synthesized: use them
   only if the user explicitly allows synthesized sounds, and say which cues they are.
4. **You cannot hear.** Say what was measured (Earshot, real-sfx critique) and list the moments a human should listen to.
5. **Do not delete or overwrite other skills, libraries, taste files or config.**

## Workflow

### 0. Check the toolchain (once per session)
```
bash $S/doctor.sh           # python>=3.10, ffmpeg+filters, real-sfx config/index, Openverse, Earshot models, Codex MCP
```

### 1. Look and listen to the input
```
cd $R
python3 scripts/look.py VIDEO --out WORK/look              # frames + spectrogram of the native sound
python3 scripts/listen.py voice VIDEO                      # share of speech / music -> --voice-safe or --duck
```
Earshot MCP `timeline` (file=VIDEO, video=VIDEO) gives events, sections, beat grid; `sheet` an annotated PNG.

### 2. Find the moments
Best source first (details: `$R/SKILL.md` step 2):
- project event list / synth script / HyperFrames: `from_cues.py`, `from_hyperframes.py`;
- screen recording: `ui_events.py` (`$R/references/screencast.md`);
- picture only: `find_moments.py VIDEO --out WORK/moments --fine`, then `look.py VIDEO --at T --span 2.4 --step 0.1`
  around each moment and **write your own typed cue list** (`$R/references/typed-cues.md`). Automation finds only the
  big moves of soft animation; you must read the frames.

Map picture events to kinds (see `references/event-map.md` here for the full table):
| picture | kind / role | placement |
|---|---|---|
| text slides / flies in | `whoosh` | peak on the landing frame |
| words / letters pop in | `pop` or `click` (light, one family) | start on the frame each word appears |
| typewriter text | `key` (typing) 8-14 keys/s | per character, one keyboard |
| wipe / slide / push transition | `whoosh` (short) | peak at the transition's middle |
| hard cut to a new scene | light `hit` (at most 1/3 of cuts) | on the cut frame |
| logo scale-up / reveal | `riser` into `hit` + `chime` layer (≤3 layers) | riser ends / hit on the settle frame |
| object moves across | `whoosh` panned with the object (`pan`) | peak at closest/fastest point |
| fade-in of small text | soft `chime`/`ui` or nothing | onset; silence is allowed |

### 3. Get sounds (Openverse -> licence-checked library)
```
python3 $S/openverse_sfx.py search "whoosh" --policy strict           # look first (no download)
python3 $S/openverse_sfx.py plan whoosh="whoosh,swoosh" impact="impact,thud" pop="pop,cork" \
        chime="bell,chime" click="click,switch" typing="typewriter" riser="cymbal roll" --n 3 [--policy attribution]
python3 $S/openverse_sfx.py audit                                      # every file + licence
~/.codex/tools/earshot/.venv/bin/python -I $S/listen_gate.py           # Earshot hears every new file: rejects
         # speech / music (Openverse titles lie: a Wikimedia "whoosh" is often someone pronouncing the word)
cd $R && python3 scripts/setup.py add-library openverse ~/.agents/sfx-library/openverse --tier main --index
         # or --tier extra when the user already has a main library; re-run build_index.py after every new fetch
python3 scripts/listen.py tag-index                                    # YAMNet tags for new sounds
```
- Default policy `strict` (CC0 + PDM). `attribution` adds CC BY: fine commercially, but credits are mandatory.
- Anonymous Openverse: 20 req/min, 200/day; set `OPENVERSE_TOKEN` for more. Uncached searches can take 30-60 s
  (`VSD_TIMEOUT=90`). Never add `mature=false` (it hangs the API). `--source wikimedia_audio|freesound` filters on
  the server: slow (30-110 s) but saves pages. Freesound holds almost all real SFX on Openverse; Wikimedia audio is
  mostly music and word pronunciations.
- If a provider's CDN refuses downloads (HTTP 403, e.g. Freesound from some cloud IPs), skip it with
  `--exclude-provider freesound` (or `VSD_EXCLUDE_PROVIDERS`); the fetcher reports skipped items, never fakes them.
- Use Earshot MCP `rank` (query + candidate paths) to pick the best download for a description, `describe` to name
  what a file is, `find` to locate the usable hit inside a long recording (use the trims as `slice`).

### 4. Cue sheet and mix
```
cd $R
python3 scripts/from_cues.py WORK/events.json --video VIDEO --out WORK/cues.json   # your typed list -> sheet
# or: python3 scripts/suggest_cues.py WORK/moments/moments.json --out WORK/cues.json
python3 scripts/mix.py WORK/cues.json --out RESULT/film_sfx.mp4 --plan              # check what lands where
python3 scripts/mix.py WORK/cues.json --out RESULT/film_sfx.mp4 --voice-safe        # speech present
```
Keep levels under the voice (SFX 6-10 dB below speech), at most 3 layers per moment, one sound family for UI/text.

### 5. Verify (loop until good)
```
python3 scripts/verify.py   RESULT/film_sfx_resolved_cues.json RESULT/film_sfx_sfx_track.wav
python3 scripts/critique.py RESULT/film_sfx_resolved_cues.json RESULT/film_sfx_sfx_track.wav --moments WORK/moments/moments.json --out RESULT/critique.md
python3 $S/qa.py VIDEO RESULT/film_sfx.mp4 --resolved RESULT/film_sfx_resolved_cues.json --json RESULT/qa.json
```
Earshot (MCP): `timeline` with `video` + `cues` -> sync of each sound to its cut; `critique` with `video` -> scorecard
against professional launch films with timestamped fixes; `describe` on 2-3 key sounds to confirm they are what the
label says. Fix with `sheet.py set/gain/apply` and remix. Stop when real-sfx critique ≥ 8 and qa.py PASS.

### 6. Licence check and delivery
```
python3 $S/openverse_sfx.py credits RESULT/film_sfx_resolved_cues.json --out RESULT/CREDITS.md --strict
```
Deliver: the MP4, the separate SFX WAV, `CREDITS.md` (attribution text if any CC BY sound is used), qa numbers
(video bit-identical, base-audio correlation, LUFS / true peak), what stayed silent and why, and 3-5 timecodes to listen to.

## Install / repair
`references/install.md` (Codex paths, MCP config, models, how to reinstall without touching other skills).
