import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Универсальный «оживший» рендер ЖК: движение камеры, дышащее свечение окон,
// мерцающие огни, световые росчерки машин по дорогам, опционально бассейн и
// идущие люди. Бесшовный цикл: кадр 0 совпадает с последним.

const TAU = Math.PI * 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Spark = { x: number; y: number; c: number; p: number; s: number };
export type Car = { c: number; p: number; red: boolean };
export type Road = { ax: number; ay: number; bx: number; by: number; cars: Car[] };
export type Pool = { x: number; y: number; w: number; h: number };
export type Person = { ax: number; ay: number; bx: number; by: number; c: number; p: number };

export type LivingHeroProps = {
  src: string;
  sparks: Spark[];
  roads: Road[];
  pool?: Pool | null;
  people?: Person[];
  camScale?: number;
};

export const LivingHero: React.FC<LivingHeroProps> = ({
  src,
  sparks,
  roads,
  pool = null,
  people = [],
  camScale = 0.05,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames; // 0..1, бесшовно

  const breathe = (1 - Math.cos(TAU * t)) / 2; // 0→1→0
  const scale = 1.05 + camScale * breathe;
  const panX = Math.sin(TAU * t) * 1.4;
  const panY = Math.cos(TAU * t) * 0.8;

  const glowBreath = (1 - Math.cos(TAU * 2 * t)) / 2;
  const glowOpacity = 0.16 + 0.26 * glowBreath;

  const poolPulse = 0.5 + 0.5 * Math.sin(TAU * 3 * t);

  return (
    <AbsoluteFill style={{ backgroundColor: "#070a14", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${panX}%, ${panY}%)`,
          willChange: "transform",
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* свечение окон/фонарей — копия со смешиванием screen */}
        <Img
          src={staticFile(src)}
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

        {pool && (
          <div
            style={{
              position: "absolute",
              left: `${pool.x}%`,
              top: `${pool.y}%`,
              width: `${pool.w}%`,
              height: `${pool.h}%`,
              background:
                "radial-gradient(ellipse at center, rgba(120,230,255,0.55), rgba(120,230,255,0) 70%)",
              mixBlendMode: "screen",
              filter: "blur(6px)",
              opacity: 0.35 + 0.35 * poolPulse,
            }}
          />
        )}

        {/* мерцающие огни окон */}
        {sparks.map((sp, i) => {
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

        {/* идущие люди — мягкие тёмные силуэты с лёгкой тенью */}
        {people.map((pe, i) => {
          let p = (pe.c * t + pe.p) % 1;
          if (p < 0) p += 1;
          // ходьба туда-обратно, чтобы не «телепортировались»
          const tri = p < 0.5 ? p * 2 : 2 - p * 2;
          const x = lerp(pe.ax, pe.bx, tri);
          const y = lerp(pe.ay, pe.by, tri);
          const bob = Math.abs(Math.sin(TAU * 6 * p)) * 0.4; // лёгкое покачивание
          return (
            <div
              key={`p${i}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y - bob}%`,
                width: 2.2,
                height: 4.4,
                borderRadius: "40% 40% 30% 30%",
                background: "rgba(20,18,24,0.75)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                opacity: 0.7,
              }}
            />
          );
        })}

        {/* световые росчерки машин вдоль дорог */}
        {roads.map((road, ri) => {
          const angle =
            (Math.atan2(road.by - road.ay, road.bx - road.ax) * 180) / Math.PI;
          return road.cars.map((car, i) => {
            let p = (car.c * t + car.p) % 1;
            if (p < 0) p += 1;
            const x = lerp(road.ax, road.bx, p);
            const y = lerp(road.ay, road.by, p);
            const near = 1 - p;
            const len = 30 + near * 66;
            const wid = 2 + near * 3.4;
            const edge = Math.min(1, p / 0.12, (1 - p) / 0.12);
            const op = Math.max(0, edge) * (0.6 + 0.4 * near);
            const color = car.red
              ? "linear-gradient(90deg, rgba(255,70,60,0.95), rgba(255,70,60,0))"
              : "linear-gradient(90deg, rgba(255,200,150,0), rgba(255,225,180,0.98))";
            const glow = car.red ? "rgba(255,70,60,0.5)" : "rgba(255,210,160,0.55)";
            return (
              <div
                key={`r${ri}c${i}`}
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
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  opacity: op,
                }}
              />
            );
          });
        })}
      </AbsoluteFill>

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
