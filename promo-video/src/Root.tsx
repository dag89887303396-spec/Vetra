import "./index.css";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { FPS, TOTAL_DURATION } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
