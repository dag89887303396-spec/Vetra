import {Composition} from 'remotion';
import {getVideoMetadata} from '@remotion/media-utils';
import {HighlightVideo, HighlightVideoProps} from './HighlightVideo';
import {
  CLIPS,
  captionsFile,
  FALLBACK_CLIP_FRAMES,
  FPS,
  HEIGHT,
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
          // Placeholder; replaced in calculateMetadata once the clip length is
          // probed. Output length == the clip length (no intro/outro).
          durationInFrames={FALLBACK_CLIP_FRAMES}
          defaultProps={
            {
              src: clip.src,
              captionsSrc: captionsFile(clip.id),
            } satisfies HighlightVideoProps
          }
          calculateMetadata={async ({props}) => {
            try {
              const meta = await getVideoMetadata(props.src);
              return {
                durationInFrames: Math.round(meta.durationInSeconds * FPS),
              };
            } catch (err) {
              console.warn(
                `Could not probe ${props.src}; using fallback duration.`,
                err
              );
              return {durationInFrames: FALLBACK_CLIP_FRAMES};
            }
          }}
        />
      ))}
    </>
  );
};
