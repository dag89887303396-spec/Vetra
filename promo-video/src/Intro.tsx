import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS } from "./theme";
import { FONT_BODY, FONT_HEADING } from "./fonts";

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const Char: React.FC<{ ch: string; index: number; frame: number; startAt: number }> = ({
  ch,
  index,
  frame,
  startAt,
}) => {
  const t = frame - startAt - index * 2.2;
  const opacity = interpolate(t, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const y = interpolate(t, [0, 16], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const blur = interpolate(t, [0, 16], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span
      style={{
        display: "inline-block",
        whiteSpace: "pre",
        opacity,
        transform: `translateY(${y}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      {ch}
    </span>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // Контур треугольника прорисовывается как на прелоадере сайта
  const dash = interpolate(frame, [5, 45], [400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const logoOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const brandOpacity = interpolate(frame, [30, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const tagOpacity = interpolate(frame, [86, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [96, 110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line1 = "Живите";
  const line2 = "на высоте";

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
        gap: 30,
      }}
    >
      <svg width={170} height={170} viewBox="0 0 60 60" style={{ opacity: logoOpacity }}>
        <polygon
          points="30,6 55,49 5,49"
          stroke={COLORS.gold}
          strokeWidth={1.6}
          fill="none"
          strokeDasharray={400}
          strokeDashoffset={dash}
        />
      </svg>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 38,
          letterSpacing: "0.5em",
          marginLeft: "0.5em",
          color: COLORS.gold,
          opacity: brandOpacity,
          fontWeight: 500,
        }}
      >
        VETRA ESTATE
      </div>
      <h1
        style={{
          fontFamily: FONT_HEADING,
          fontWeight: 600,
          fontSize: 120,
          lineHeight: 1.15,
          textAlign: "center",
          color: COLORS.text,
          margin: 0,
        }}
      >
        <div>
          {[...line1].map((ch, i) => (
            <Char key={i} ch={ch} index={i} frame={frame} startAt={42} />
          ))}
        </div>
        <div style={{ color: COLORS.gold }}>
          {[...line2].map((ch, i) => (
            <Char key={i} ch={ch} index={i} frame={frame} startAt={56} />
          ))}
        </div>
      </h1>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 26,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: COLORS.muted,
          opacity: tagOpacity,
        }}
      >
        Новостройки Дагестана
      </div>
    </AbsoluteFill>
  );
};
