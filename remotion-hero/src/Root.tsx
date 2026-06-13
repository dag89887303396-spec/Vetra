import "./index.css";
import { Composition } from "remotion";
import { LivingHero, LivingHeroProps } from "./LivingHero";

// АК «Алые Паруса» — близкий вид с променадом и бассейном
const alye: LivingHeroProps = {
  src: "alye-night.jpg",
  pool: { x: 26, y: 70, w: 20, h: 16 },
  sparks: [
    { x: 24, y: 30, c: 3, p: 0.0, s: 3 }, { x: 30, y: 24, c: 4, p: 0.3, s: 2.4 },
    { x: 33, y: 38, c: 3, p: 0.6, s: 2.8 }, { x: 38, y: 20, c: 5, p: 0.15, s: 2.2 },
    { x: 41, y: 33, c: 3, p: 0.8, s: 3 }, { x: 46, y: 26, c: 4, p: 0.45, s: 2.6 },
    { x: 49, y: 41, c: 3, p: 0.1, s: 2.4 }, { x: 53, y: 22, c: 5, p: 0.7, s: 2.2 },
    { x: 56, y: 36, c: 3, p: 0.35, s: 2.8 }, { x: 60, y: 28, c: 4, p: 0.9, s: 2.6 },
    { x: 63, y: 44, c: 3, p: 0.2, s: 2.4 }, { x: 67, y: 31, c: 5, p: 0.55, s: 2.2 },
    { x: 70, y: 47, c: 3, p: 0.05, s: 3 }, { x: 36, y: 47, c: 4, p: 0.65, s: 2.6 },
    { x: 58, y: 50, c: 3, p: 0.4, s: 2.4 },
  ],
  roads: [
    { ax: 71, ay: 93, bx: 90, by: 30, cars: [
      { c: 2, p: 0.0, red: false }, { c: 2, p: 0.5, red: false },
      { c: 2, p: 0.25, red: true }, { c: 3, p: 0.7, red: true },
      { c: 3, p: 0.15, red: false },
    ] },
  ],
  // люди на променаде у бассейна и площади между корпусами
  people: [
    { ax: 30, ay: 66, bx: 44, by: 67, c: 1, p: 0.0 },
    { ax: 46, ay: 60, bx: 56, by: 58, c: 1, p: 0.4 },
    { ax: 40, ay: 64, bx: 33, by: 70, c: 1, p: 0.7 },
    { ax: 52, ay: 55, bx: 48, by: 62, c: 1, p: 0.2 },
    { ax: 35, ay: 80, bx: 50, by: 81, c: 1, p: 0.55 },
    { ax: 58, ay: 57, bx: 64, by: 60, c: 1, p: 0.85 },
  ],
  camScale: 0.05,
};

// ЖК «Новый Горизонт» — широкая панорама квартала
const horizon: LivingHeroProps = {
  src: "horizon-night.jpg",
  sparks: [
    { x: 18, y: 32, c: 3, p: 0.0, s: 2.4 }, { x: 24, y: 26, c: 4, p: 0.3, s: 2.2 },
    { x: 28, y: 44, c: 3, p: 0.6, s: 2.4 }, { x: 34, y: 36, c: 5, p: 0.15, s: 2 },
    { x: 22, y: 52, c: 3, p: 0.8, s: 2.2 }, { x: 40, y: 30, c: 4, p: 0.45, s: 2.4 },
    { x: 32, y: 60, c: 3, p: 0.1, s: 2 }, { x: 46, y: 48, c: 5, p: 0.7, s: 2.2 },
    { x: 52, y: 26, c: 3, p: 0.35, s: 2.4 }, { x: 60, y: 40, c: 4, p: 0.9, s: 2.2 },
    { x: 66, y: 30, c: 3, p: 0.2, s: 2.4 }, { x: 72, y: 46, c: 5, p: 0.55, s: 2 },
    { x: 78, y: 36, c: 3, p: 0.05, s: 2.2 }, { x: 58, y: 58, c: 4, p: 0.65, s: 2.4 },
    { x: 68, y: 60, c: 3, p: 0.4, s: 2 }, { x: 44, y: 64, c: 4, p: 0.25, s: 2.2 },
  ],
  roads: [
    // широкая дорога вдоль низа кадра
    { ax: 6, ay: 90, bx: 80, by: 95, cars: [
      { c: 2, p: 0.0, red: false }, { c: 2, p: 0.33, red: false },
      { c: 2, p: 0.66, red: true }, { c: 3, p: 0.2, red: true },
    ] },
    // правая дорога вглубь кадра
    { ax: 84, ay: 86, bx: 92, by: 50, cars: [
      { c: 2, p: 0.1, red: false }, { c: 2, p: 0.6, red: true },
    ] },
  ],
  camScale: 0.045,
};

// ЖК «Московский» — кластер башен
const moscow: LivingHeroProps = {
  src: "moscow-night.jpg",
  sparks: [
    { x: 14, y: 30, c: 3, p: 0.0, s: 2.6 }, { x: 22, y: 22, c: 4, p: 0.3, s: 2.4 },
    { x: 30, y: 36, c: 3, p: 0.6, s: 2.6 }, { x: 38, y: 18, c: 5, p: 0.15, s: 2.2 },
    { x: 26, y: 50, c: 3, p: 0.8, s: 2.4 }, { x: 44, y: 28, c: 4, p: 0.45, s: 2.6 },
    { x: 50, y: 40, c: 3, p: 0.1, s: 2.2 }, { x: 56, y: 22, c: 5, p: 0.7, s: 2.4 },
    { x: 62, y: 34, c: 3, p: 0.35, s: 2.6 }, { x: 68, y: 18, c: 4, p: 0.9, s: 2.2 },
    { x: 74, y: 40, c: 3, p: 0.2, s: 2.4 }, { x: 82, y: 30, c: 5, p: 0.55, s: 2.2 },
    { x: 18, y: 46, c: 3, p: 0.05, s: 2.6 }, { x: 60, y: 52, c: 4, p: 0.65, s: 2.4 },
    { x: 78, y: 52, c: 3, p: 0.4, s: 2.2 }, { x: 40, y: 46, c: 4, p: 0.25, s: 2.4 },
  ],
  roads: [
    // освещённая улица по центру вниз
    { ax: 32, ay: 97, bx: 56, by: 56, cars: [
      { c: 2, p: 0.0, red: false }, { c: 2, p: 0.5, red: true },
      { c: 3, p: 0.25, red: false },
    ] },
    // поперечная улица справа
    { ax: 40, ay: 60, bx: 88, by: 80, cars: [
      { c: 2, p: 0.15, red: false }, { c: 2, p: 0.65, red: true },
    ] },
  ],
  camScale: 0.05,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AlyeHero" component={LivingHero} durationInFrames={240}
        fps={30} width={1280} height={720} defaultProps={alye} />
      <Composition id="HorizonHero" component={LivingHero} durationInFrames={240}
        fps={30} width={1280} height={720} defaultProps={horizon} />
      <Composition id="MoscowHero" component={LivingHero} durationInFrames={240}
        fps={30} width={1280} height={720} defaultProps={moscow} />
    </>
  );
};
