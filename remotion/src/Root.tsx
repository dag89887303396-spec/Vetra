import {Composition} from 'remotion';
import {getVideoMetadata} from '@remotion/media-utils';
import {HighlightVideo, HighlightVideoProps} from './HighlightVideo';
import {
  CLIPS,
  FALLBACK_CLIP_FRAMES,
  FPS,
  HEIGHT,
  INTRO_FRAMES,
  OUTRO_FRAMES,
  WIDTH,
} from './clips';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {CLIPS.map((clip) => (
        <Composition
          key={clip.id}
          id={clip.id}
          component={HighlightVideo}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          // Placeholder; the real duration is computed in calculateMetadata once
          // the source clip's length is probed.
          durationInFrames={INTRO_FRAMES + FALLBACK_CLIP_FRAMES + OUTRO_FRAMES}
          defaultProps={
            {
              kicker: clip.kicker,
              title: clip.title,
              src: clip.src,
              introFrames: INTRO_FRAMES,
              outroFrames: OUTRO_FRAMES,
            } satisfies HighlightVideoProps
          }
          calculateMetadata={async ({props}) => {
            let clipFrames = FALLBACK_CLIP_FRAMES;
            try {
              const meta = await getVideoMetadata(props.src);
              clipFrames = Math.round(meta.durationInSeconds * FPS);
            } catch (err) {
              // Network blocked or clip unreachable: fall back to a fixed length
              // so Studio/render still works for layout previews.
              console.warn(
                `Could not probe ${props.src}; using fallback duration.`,
                err
              );
            }
            return {
              durationInFrames:
                props.introFrames + clipFrames + props.outroFrames,
            };
          }}
        />
      ))}
    </>
  );
};
