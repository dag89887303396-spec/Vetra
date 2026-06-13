import "./index.css";
import { Composition } from "remotion";
import { AlyeHero } from "./AlyeHero";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AlyeHero"
        component={AlyeHero}
        durationInFrames={240}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
