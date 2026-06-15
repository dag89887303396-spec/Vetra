import {AbsoluteFill, OffthreadVideo} from 'remotion';
import {Captions} from './Captions';

export type HighlightVideoProps = {
  src: string;
  /** staticFile path to the caption timings JSON for this clip. */
  captionsSrc: string;
};

// Output = the clip itself with Remotion-rendered karaoke captions on top.
// (Intro/outro cards were removed per request.)
export const HighlightVideo: React.FC<HighlightVideoProps> = ({
  src,
  captionsSrc,
}) => {
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo
        src={src}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <Captions src={captionsSrc} />
    </AbsoluteFill>
  );
};
