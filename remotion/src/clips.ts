// The 5 highlight clips produced by Higgsfield from the YouTube live stream
// (https://www.youtube.com/live/rmsfWJBQVAM), 16:9, with Bebas Neue subtitles
// already baked in.
//
// `src` points at the Higgsfield CDN. Remotion fetches it at render time, so you
// must run the render on a machine/network that can reach this host. If your
// environment blocks the CDN, download each mp4 locally into ./public/clips/ and
// change `src` to e.g. `staticFile('clips/clip_01.mp4')`.

export type Clip = {
  id: string;
  /** Headline shown on the intro card. */
  title: string;
  /** Short kicker line shown above the title. */
  kicker: string;
  /** Source video URL (or staticFile path if you downloaded the clips). */
  src: string;
};

const CDN =
  'https://d8j0ntlcm91z4.cloudfront.net/clipify/user_39oW86LGLduzvzApbVLM1WxZCvW/d3d7da7d-ed45-448c-8015-24334095fa9f/d3d7da7d-ed45-448c-8015-24334095fa9f/clips';

export const CLIPS: Clip[] = [
  {
    id: 'clip-01',
    kicker: 'HIGHLIGHT 01',
    title: 'Morocco Scores On Brazil And Speed Loses It',
    src: `${CDN}/clip_01.mp4`,
  },
  {
    id: 'clip-02',
    kicker: 'HIGHLIGHT 02',
    title: "Speed Calls Vinny's Goal Seconds Before It Happens",
    src: `${CDN}/clip_02.mp4`,
  },
  {
    id: 'clip-03',
    kicker: 'HIGHLIGHT 03',
    title: "Brazil Legend Tells Speed He Has 'No Chance'",
    src: `${CDN}/clip_03.mp4`,
  },
  {
    id: 'clip-04',
    kicker: 'HIGHLIGHT 04',
    title: 'Speed Tells Travis Scott To Make Rocky Lock In',
    src: `${CDN}/clip_04.mp4`,
  },
  {
    id: 'clip-05',
    kicker: 'HIGHLIGHT 05',
    title: "Speed Accidentally Sits In The Mayor's Seat",
    src: `${CDN}/clip_05.mp4`,
  },
];

// Channel branding shown on intro/outro cards. Tweak freely.
export const BRAND = {
  channel: 'YOUR CHANNEL',
  cta: 'SUBSCRIBE FOR MORE',
  accent: '#FFC400',
};

// Timing (frames at 30fps).
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const INTRO_FRAMES = 60; // 2s title card
export const OUTRO_FRAMES = 75; // 2.5s subscribe card
export const FALLBACK_CLIP_FRAMES = 30 * 30; // 30s, used only if duration can't be probed
