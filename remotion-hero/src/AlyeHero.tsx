import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Лёгкая «живая» анимация ночного рендера АК «Алые Паруса»:
// мягкое движение камеры, дышащее свечение окон, мерцающие огни и
// световые росчерки машин вдоль дороги. Сделано бесшовным циклом —
// кадр 0 совпадает с последним кадром, чтобы зациклить как фон hero.

const TAU = Math.PI * 2;

// окна корпусов (проценты от кадра) + индивидуальная частота/фаза мерцания
const SPARKS: { x: number; y: number; c: number; p: number; s: number }[] = [
  { x: 24, y: 30, c: 3, p: 0.0, s: 3 },
  { x: 30, y: 24, c: 4, p: 0.3, s: 2.4 },
  { x: 33, y: 38, c: 3, p: 0.6, s: 2.8 },
  { x: 38, y: 20, c: 5, p: 0.15, s: 2.2 },
  { x: 41, y: 33, c: 3, p: 0.8, s: 3 },
  { x: 46, y: 26, c: 4, p: 0.45, s: 2.6 },
  { x: 49, y: 41, c: 3, p: 0.1, s: 2.4 },
  { x: 53, y: 22, c: 5, p: 0.7, s: 2.2 },
  { x: 56, y: 36, c: 3, p: 0.35, s: 2.8 },
  { x: 60, y: 28, c: 4, p: 0.9, s: 2.6 },
  { x: 63, y: 44, c: 3, p: 0.2, s: 2.4 },
  { x: 67, y: 31, c: 5, p: 0.55, s: 2.2 },
  { x: 70, y: 47, c: 3, p: 0.05, s: 3 },
  { x: 36, y: 47, c: 4, p: 0.65, s: 2.6 },
  { x: 58, y: 50, c: 3, p: 0.4, s: 2.4 },
];

// дорога справа: вдоль корпусов от низа кадра вглубь к верхне-правому краю
const ROAD = { ax: 71, ay: 93, bx: 90, by: 30 };
const roadAngle =
  (Math.atan2(ROAD.by - ROAD.ay, ROAD.bx - ROAD.ax) * 180) / Math.PI;

const CARS: { c: number; p: number; red: boolean }[] = [
  { c: 2, p: 0.0, red: false },
  { c: 2, p: 0.5, red: false },
  { c: 2, p: 0.25, red: true },
  { c: 3, p: 0.7, red: true },
  { c: 3, p: 0.15, red: false },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const AlyeHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames; // 0..1, бесшовно

  // плавное «дыхание» камеры (возвращается в исходное к концу цикла)
  const breathe = (1 - Math.cos(TAU * t)) / 2; // 0→1→0
  const scale = 1.05 + 0.05 * breathe;
  const panX = Math.sin(TAU * t) * 1.4; // %
  const panY = Math.cos(TAU * t) * 0.8; // %

  // общее дыхание света (2 цикла за петлю)
  const glowBreath = (1 - Math.cos(TAU * 2 * t)) / 2;
  const glowOpacity = 0.16 + 0.26 * glowBreath;

  // лёгкое мерцание бассейна
  const poolPulse = 0.5 + 0.5 * Math.sin(TAU * 3 * t);

  return (
    <AbsoluteFill style={{ backgroundColor: "#070a14", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${panX}%, ${panY}%)`,
          willChange: "transform",
        }}
      >
        {/* базовый рендер */}
        <Img
          src={staticFile("alye-night.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* свечение окон/фонарей — копия со смешиванием screen */}
        <Img
          src={staticFile("alye-night.jpg")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            mixBlendMode: "screen",
            filter: "blur(3px) brightness(1.25) saturate(1.3)",
            opacity: glowOpacity,
          }}
        />

        {/* мерцание бассейна */}
        <div
          style={{
            position: "absolute",
            left: "26%",
            top: "70%",
            width: "20%",
            height: "16%",
            background:
              "radial-gradient(ellipse at center, rgba(120,230,255,0.55), rgba(120,230,255,0) 70%)",
            mixBlendMode: "screen",
            filter: "blur(6px)",
            opacity: 0.35 + 0.35 * poolPulse,
          }}
        />

        {/* мерцающие огни окон */}
        {SPARKS.map((sp, i) => {
          const v = Math.sin(TAU * (sp.c * t + sp.p));
          const op = Math.max(0, v) ** 1.5;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${sp.x}%`,
                top: `${sp.y}%`,
                width: sp.s,
                height: sp.s,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,240,200,0.95), rgba(255,210,140,0) 70%)",
                boxShadow: `0 0 ${4 + op * 8}px ${1 + op * 2}px rgba(255,224,160,${0.6 * op})`,
                opacity: 0.2 + 0.8 * op,
              }}
            />
          );
        })}

        {/* световые росчерки машин вдоль дороги */}
        {CARS.map((car, i) => {
          let p = (car.c * t + car.p) % 1;
          if (p < 0) p += 1;
          const x = lerp(ROAD.ax, ROAD.bx, p);
          const y = lerp(ROAD.ay, ROAD.by, p);
          const near = 1 - p; // ближе к камере на старте дороги
          const len = 30 + near * 66;
          const wid = 2 + near * 3.4;
          // плавное появление/затухание у концов отрезка
          const edge = Math.min(1, p / 0.12, (1 - p) / 0.12);
          const op = Math.max(0, edge) * (0.6 + 0.4 * near);
          const color = car.red
            ? "linear-gradient(90deg, rgba(255,70,60,0.95), rgba(255,70,60,0))"
            : "linear-gradient(90deg, rgba(255,200,150,0), rgba(255,225,180,0.98))";
          const glow = car.red ? "rgba(255,70,60,0.5)" : "rgba(255,210,160,0.55)";
          return (
            <div
              key={`c${i}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: len,
                height: wid,
                borderRadius: wid,
                background: color,
                boxShadow: `0 0 ${6 + near * 10}px ${2 + near * 3}px ${glow}`,
                filter: "blur(0.6px)",
                transform: `translate(-50%, -50%) rotate(${roadAngle}deg)`,
                opacity: op,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* кинематографичная виньетка */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 120% at 50% 38%, rgba(0,0,0,0) 55%, rgba(4,6,14,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
