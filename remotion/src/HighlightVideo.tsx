import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/BebasNeue';
import {BRAND, INTRO_FRAMES, OUTRO_FRAMES} from './clips';

const {fontFamily} = loadFont();

export type HighlightVideoProps = {
  kicker: string;
  title: string;
  src: string;
  introFrames: number;
  outroFrames: number;
};

const IntroCard: React.FC<{kicker: string; title: string}> = ({
  kicker,
  title,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width} = useVideoConfig();
  // Sizes relative to frame width so the card works in both 9:16 and 16:9.
  const vw = width / 100;

  const enter = spring({frame, fps, config: {damping: 200}});
  const exit = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const opacity = enter * exit;
  const translateY = interpolate(enter, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
      }}
    >
      <div style={{opacity, transform: `translateY(${translateY}px)`, textAlign: 'center', padding: `0 ${vw * 8}px`}}>
        <div
          style={{
            color: BRAND.accent,
            fontSize: vw * 4,
            letterSpacing: vw,
            marginBottom: vw * 2.2,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            color: 'white',
            fontSize: vw * 9,
            lineHeight: 1.02,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: vw * 4,
            height: vw * 0.7,
            width: interpolate(enter, [0, 1], [0, vw * 28]),
            backgroundColor: BRAND.accent,
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: 4,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const vw = width / 100;
  const enter = spring({frame, fps, config: {damping: 200}});
  const pulse = 1 + 0.04 * Math.sin(frame / 6);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
      }}
    >
      <div style={{opacity: enter, textAlign: 'center'}}>
        <div
          style={{
            transform: `scale(${pulse})`,
            color: 'white',
            backgroundColor: BRAND.accent,
            fontSize: vw * 6,
            letterSpacing: vw * 0.5,
            padding: `${vw * 2.4}px ${vw * 6}px`,
            borderRadius: 18,
            display: 'inline-block',
          }}
        >
          {BRAND.cta}
        </div>
        <div
          style={{
            marginTop: vw * 3.5,
            color: 'white',
            fontSize: vw * 4.5,
            letterSpacing: vw * 0.8,
          }}
        >
          {BRAND.channel}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const HighlightVideo: React.FC<HighlightVideoProps> = ({
  kicker,
  title,
  src,
  introFrames,
  outroFrames,
}) => {
  const {durationInFrames} = useVideoConfig();
  const clipFrames = durationInFrames - introFrames - outroFrames;
  // Cross-fade windows between segments.
  const fade = 12;

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Sequence durationInFrames={introFrames} name="Intro">
        <IntroCard kicker={kicker} title={title} />
      </Sequence>

      <Sequence from={introFrames} durationInFrames={clipFrames + fade} name="Clip">
        <ClipSegment src={src} fade={fade} durationInFrames={clipFrames} />
      </Sequence>

      <Sequence from={introFrames + clipFrames} durationInFrames={outroFrames} name="Outro">
        <OutroCard />
      </Sequence>
    </AbsoluteFill>
  );
};

const ClipSegment: React.FC<{src: string; fade: number; durationInFrames: number}> = ({
  src,
  fade,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  return (
    <AbsoluteFill style={{opacity, backgroundColor: 'black'}}>
      {/* Clips are cut in the target aspect, so cover fills the frame cleanly. */}
      <OffthreadVideo src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};
