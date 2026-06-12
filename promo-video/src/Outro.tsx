import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "./theme";
import { FONT_BODY, FONT_HEADING } from "./fonts";

const ease = Easing.bezier(0.22, 1, 0.36, 1);

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoPop = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120 } });
  const titleIn = interpolate(frame, [18, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const ctaIn = spring({ frame: frame - 44, fps, config: { damping: 100, stiffness: 90 } });
  const contactsIn = interpolate(frame, [62, 82], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const pulse = 1 + 0.02 * Math.sin(frame / 9);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
        gap: 36,
        padding: "0 80px",
      }}
    >
      <svg
        width={150}
        height={150}
        viewBox="0 0 60 60"
        style={{ transform: `scale(${logoPop})` }}
      >
        <polygon points="30,6 55,49 5,49" stroke={COLORS.gold} strokeWidth={1.6} fill="none" />
      </svg>

      <div
        style={{
          fontFamily: FONT_HEADING,
          fontWeight: 600,
          fontSize: 86,
          lineHeight: 1.2,
          textAlign: "center",
          color: COLORS.text,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 40}px)`,
        }}
      >
        Ваша квартира
        <br />
        <span style={{ color: COLORS.gold }}>у Каспия</span>
      </div>

      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 27,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: COLORS.muted,
          opacity: titleIn,
        }}
      >
        Махачкала · Каспийск
      </div>

      <div
        style={{
          marginTop: 26,
          opacity: ctaIn,
          transform: `translateY(${(1 - ctaIn) * 60}px) scale(${pulse})`,
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#0A0E1A",
          background: `linear-gradient(135deg, ${COLORS.gold}, #A8853E)`,
          padding: "30px 70px",
          borderRadius: 8,
        }}
      >
        Выбрать квартиру
      </div>

      <div
        style={{
          opacity: contactsIn,
          textAlign: "center",
          fontFamily: FONT_BODY,
          color: COLORS.text,
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}
      >
        +7 989 470-22-63
        <div style={{ fontSize: 25, color: COLORS.muted, marginTop: 12, letterSpacing: "0.2em" }}>
          WHATSAPP · VETRA ESTATE
        </div>
      </div>
    </AbsoluteFill>
  );
};
