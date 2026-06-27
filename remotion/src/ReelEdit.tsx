// Vertical 9:16 Reel overlay editor — NON-generative.
//
// The original (ffmpeg-enhanced) video plays untouched underneath; everything
// else is drawn ON TOP with Remotion:
//   - 3 timed captions (exact text) with white/yellow words on a rounded dark
//     pill, smooth fade + slide-up in and out
//   - a soft "whoosh" SFX synced to each caption's appearance
//   - light motion graphics: an animated title pill with a hard-hat icon + glow
//
// Source of truth: src/reel.data.json. Run enhance-reel.mjs first to produce
// public/reel/enhanced.mp4 and public/sfx/whoosh.wav.
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {getVideoMetadata} from '@remotion/media-utils';
import {loadFont} from '@remotion/google-fonts/Montserrat';

const {fontFamily} = loadFont('normal', {
  weights: ['600', '700', '800'],
  subsets: ['latin', 'cyrillic'],
});

const ACCENT = '#FFC400';

export type ReelCaption = {
  text: string;
  start: number;
  end: number;
  highlight?: string[];
};

export type ReelEditProps = {
  videoSrc: string;
  sfxSrc: string;
  title: string;
  fps: number;
  captions: ReelCaption[];
};

// Strip surrounding punctuation/quotes so "«Новый" matches "Новый".
const normalize = (s: string) =>
  s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();

export const calculateReelMetadata = async ({
  props,
}: {
  props: ReelEditProps;
}) => {
  const fps = props.fps ?? 30;
  let fromVideo = 0;
  try {
    const meta = await getVideoMetadata(staticFile(props.videoSrc));
    fromVideo = Math.ceil(meta.durationInSeconds * fps);
  } catch {
    // enhanced.mp4 not produced yet — fall back to caption timing.
    fromVideo = 0;
  }
  const lastCaption = props.captions.reduce((m, c) => Math.max(m, c.end), 0);
  const fromCaptions = Math.ceil((lastCaption + 1.2) * fps);
  return {
    durationInFrames: Math.max(fromVideo, fromCaptions, 1),
    width: 1080,
    height: 1920,
    fps,
  };
};

export const ReelEdit: React.FC<ReelEditProps> = ({
  videoSrc,
  sfxSrc,
  title,
  captions,
}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo
        src={staticFile(videoSrc)}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />

      <TitleBar title={title} />

      {captions.map((c, i) => {
        const from = Math.round(c.start * fps);
        const durationInFrames = Math.max(1, Math.round((c.end - c.start) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            <CaptionPill caption={c} />
            <Audio src={staticFile(sfxSrc)} volume={0.45} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Lower-third caption: rounded dark pill, white text, yellow keywords,
// smooth fade + slide-up on enter and a soft fade on exit.
const CaptionPill: React.FC<{caption: ReelCaption}> = ({caption}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width} = useVideoConfig();
  const vw = width / 100;

  const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 12});
  const exit = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const opacity = Math.min(enter, exit);
  const translateY = interpolate(enter, [0, 1], [34, 0]);

  const highlights = new Set((caption.highlight ?? []).map(normalize));
  const words = caption.text.split(/\s+/);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: vw * 24,
      }}
    >
      <div
        style={{
          maxWidth: '88%',
          opacity,
          transform: `translateY(${translateY}px)`,
          background: 'rgba(12,12,14,0.74)',
          borderRadius: vw * 4,
          padding: `${vw * 3}px ${vw * 4.5}px`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: vw * 5.6,
            lineHeight: 1.18,
            textAlign: 'center',
            color: 'white',
          }}
        >
          {words.map((w, i) => {
            const hot = highlights.has(normalize(w));
            return (
              <span
                key={i}
                style={{
                  color: hot ? ACCENT : 'white',
                  margin: '0 0.16em',
                  display: 'inline-block',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Small animated title at the top: hard-hat icon + project name on a glowing pill.
const TitleBar: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const vw = width / 100;

  const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 16});
  const translateY = interpolate(enter, [0, 1], [-40, 0]);
  const glow = 0.4 + 0.25 * Math.sin((frame / fps) * 2.2);

  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center'}}>
      <div
        style={{
          marginTop: vw * 7,
          opacity: enter,
          transform: `translateY(${translateY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: vw * 1.8,
          background: 'rgba(12,12,14,0.66)',
          border: `${vw * 0.25}px solid ${ACCENT}`,
          borderRadius: vw * 10,
          padding: `${vw * 1.8}px ${vw * 4}px`,
          boxShadow: `0 0 ${vw * (3 + glow * 4)}px rgba(255,196,0,${glow})`,
        }}
      >
        <HardHat size={vw * 5} />
        <span
          style={{
            fontFamily,
            fontWeight: 700,
            fontSize: vw * 3.4,
            color: 'white',
            letterSpacing: 0.4,
          }}
        >
          {title}
        </span>
      </div>
    </AbsoluteFill>
  );
};

const HardHat: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 17h18a9 9 0 0 0-5-8.06V6a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2.94A9 9 0 0 0 3 17Z"
      fill={ACCENT}
    />
    <rect x="2" y="17" width="20" height="2.6" rx="1.3" fill="white" />
  </svg>
);
