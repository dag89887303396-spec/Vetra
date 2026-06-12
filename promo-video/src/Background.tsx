import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./theme";

// Детерминированный псевдорандом, чтобы рендер был воспроизводимым
const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const stars = useMemo(() => {
    const rnd = seeded(42);
    return Array.from({ length: 90 }, () => ({
      x: rnd() * width,
      y: rnd() * height,
      size: 1 + rnd() * 2.4,
      phase: rnd() * Math.PI * 2,
      speed: 0.02 + rnd() * 0.05,
    }));
  }, [width, height]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #04070E 0%, ${COLORS.bg2} 55%, #0B1428 80%, #04070E 100%)`,
      }}
    >
      <svg width={width} height={height}>
        {stars.map((s, i) => {
          const a = 0.15 + 0.45 * (0.5 + 0.5 * Math.sin(frame * s.speed + s.phase));
          return (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.size}
              fill={i % 4 === 0 ? COLORS.gold : "#E6EBF5"}
              opacity={a}
            />
          );
        })}
      </svg>
      {/* Тёплое свечение снизу */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 35% at 50% 100%, rgba(217,179,106,0.12), transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
