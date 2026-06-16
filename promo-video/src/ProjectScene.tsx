import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "./theme";
import { FONT_BODY, FONT_HEADING } from "./fonts";

const ease = Easing.bezier(0.22, 1, 0.36, 1);

export type ProjectSceneProps = {
  image: string;
  badge: string;
  name: string;
  location: string;
  price: string;
  area: string;
  due: string;
  index: number;
};

export const ProjectScene: React.FC<ProjectSceneProps> = ({
  image,
  badge,
  name,
  location,
  price,
  area,
  due,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 14, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Кинематографичный медленный наезд, направление чередуется
  const zoom = interpolate(frame, [0, durationInFrames], [1.12, 1.0], {
    easing: Easing.linear,
  });
  const panX = interpolate(
    frame,
    [0, durationInFrames],
    index % 2 === 0 ? [-25, 25] : [25, -25],
  );

  const cardY = spring({
    frame: frame - 12,
    fps,
    config: { damping: 100, stiffness: 80 },
  });
  const lineW = interpolate(frame, [26, 60], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const badgeIn = interpolate(frame, [6, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const metaIn = interpolate(frame, [34, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut), backgroundColor: COLORS.bg }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom}) translateX(${panX}px)`,
          }}
        />
        {/* Затемнение под текст */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(6,10,20,0.55) 0%, rgba(6,10,20,0.05) 30%, rgba(6,10,20,0.05) 45%, rgba(6,10,20,0.94) 78%)",
          }}
        />
      </AbsoluteFill>

      {/* Бейдж сверху */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: badgeIn,
          transform: `translateY(${(1 - badgeIn) * -24}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#0A0E1A",
            background: `linear-gradient(135deg, ${COLORS.gold}, #A8853E)`,
            padding: "16px 38px",
            borderRadius: 6,
          }}
        >
          {badge}
        </div>
      </div>

      {/* Информационная карточка снизу */}
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 120,
          transform: `translateY(${(1 - cardY) * 220}px)`,
          opacity: cardY,
        }}
      >
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 25,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: COLORS.gold,
            marginBottom: 22,
          }}
        >
          {location}
        </div>
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 600,
            fontSize: 92,
            lineHeight: 1.12,
            color: COLORS.text,
            marginBottom: 28,
          }}
        >
          {name}
        </div>
        <div
          style={{
            height: 2,
            width: `${lineW}%`,
            background: `linear-gradient(90deg, ${COLORS.gold}, transparent)`,
            marginBottom: 36,
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 56,
            opacity: metaIn,
            transform: `translateY(${(1 - metaIn) * 30}px)`,
          }}
        >
          {[
            [price, "цена за м²"],
            [area, "платёж/мес"],
            [due, "сдача"],
          ].map(([v, k]) => (
            <div key={k}>
              <div
                style={{
                  fontFamily: FONT_HEADING,
                  fontSize: 47,
                  fontWeight: 600,
                  color: COLORS.goldLight,
                  marginBottom: 8,
                  whiteSpace: "nowrap",
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 24,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: COLORS.muted,
                }}
              >
                {k}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
