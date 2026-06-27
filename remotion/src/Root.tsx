import {Composition} from 'remotion';
import {HighlightVideo, HighlightVideoProps} from './HighlightVideo';
import {
  ReelEdit,
  ReelEditProps,
  calculateReelMetadata,
} from './ReelEdit';
import reelData from './reel.data.json';
import {
  captionsFile,
  clipDurationSeconds,
  clipFile,
  CLIPS,
  FPS,
  HEIGHT,
  WIDTH,
} from './clips';

const reelProps = {
  videoSrc: reelData.videoSrc,
  sfxSrc: reelData.sfxSrc,
  title: reelData.title,
  fps: reelData.fps,
  captions: reelData.captions,
} satisfies ReelEditProps;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vertical 9:16 Reel overlay editor (non-generative). */}
      <Composition
        id="ReelEdit"
        component={ReelEdit}
        fps={reelData.fps}
        width={1080}
        height={1920}
        durationInFrames={Math.ceil(reelData.fps * 15)}
        defaultProps={reelProps}
        calculateMetadata={calculateReelMetadata}
      />

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
