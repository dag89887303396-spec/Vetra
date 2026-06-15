import {Composition} from 'remotion';
import {HighlightVideo, HighlightVideoProps} from './HighlightVideo';
import {
  captionsFile,
  clipDurationSeconds,
  clipFile,
  CLIPS,
  FPS,
  HEIGHT,
  WIDTH,
} from './clips';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {CLIPS.map((clip) => {
        const durationInFrames = Math.max(
          1,
          Math.round(clipDurationSeconds(clip) * FPS)
        );
        return (
          <Composition
            key={clip.id}
            id={clip.id}
            component={HighlightVideo}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            durationInFrames={durationInFrames}
            defaultProps={
              {
                src: clipFile(clip.id),
                captionsSrc: captionsFile(clip.id),
              } satisfies HighlightVideoProps
            }
          />
        );
      })}
    </>
  );
};
