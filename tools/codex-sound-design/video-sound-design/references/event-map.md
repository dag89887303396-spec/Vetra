# Picture event -> sound (for text animation, transitions, motion)

Time = the frame where the motion STARTS (real-sfx places whooshes by peak/arrival, pops/clicks by start).

| picture event | typed kind | notes |
|---|---|---|
| title flies / slides in | `whoosh` + `len` = travel time | peak lands on the stop frame; pan with direction if obvious |
| title scales up / punches in | `whoosh` short, or `thump` on the stop | not both loud |
| word-by-word reveal | `pop` per word (g 0.6-1.0) | one family; real-sfx cycles pitch ±1-3 st, `--ui-pitch off` under tonal music |
| letter-by-letter / typewriter | `key` with `len` and `n` | real keyboard; 8-14 keys/s animated |
| counter / numbers rolling | `tick` per step (thin a run to ≤15/s) | |
| fade-in of small text | soft `pop` g 0.5, or silence | silence is fine under a voice |
| wipe / slide / push / zoom transition | `wipe` (`len` = transition length) | 4 dB under a whoosh by default |
| hard cut | `hit` (≤ 1/3 of cuts) or nothing | under music: on the beat |
| glitch transition | `glitch` | 0.12-0.5 s |
| object crosses frame | `whoosh` with `len` = crossing time | `pan` -1..1 following the object |
| object lands / collides | `thump` (foley) | ball on floor is foley, never a UI sound |
| logo build / reveal | `riser` (`len` to the reveal) -> `hit` + `chime` | ≤ 3 layers; the payoff is one clean moment |
| UI click / toggle / toast | `click`, `pop`, `chime`, `success` | `--ui library` = real recordings only |
| success / badge / price | `chime` / `success` / `coins` | |

Density: a sound in the first 2 s, something new every 2-4 s; SFX-only films 7-15 gestures per 10 s. Under a voice:
SFX 6-10 dB quieter, keep accents in the pauses of speech.
