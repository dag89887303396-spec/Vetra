import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "./Background";
import { Intro } from "./Intro";
import { Outro } from "./Outro";
import { ProjectScene } from "./ProjectScene";
import { COLORS, TIMELINE } from "./theme";

export const Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence durationInFrames={TIMELINE.intro.duration + 10}>
        <Background />
      </Sequence>
      <Sequence durationInFrames={TIMELINE.intro.duration}>
        <Intro />
      </Sequence>

      <Sequence from={TIMELINE.horizon.from} durationInFrames={TIMELINE.horizon.duration}>
        <ProjectScene
          image="horizon-1.jpeg"
          badge="Редукторный район"
          name="ЖК «Новый Горизонт»"
          location="Махачкала · ул. Луговая, 12"
          price="от 60 000 ₽"
          area="от 50 000 ₽"
          due="2027"
          index={0}
        />
      </Sequence>

      <Sequence from={TIMELINE.alye.from} durationInFrames={TIMELINE.alye.duration}>
        <ProjectScene
          image="alye-day.jpg"
          badge="Премиум у моря"
          name="АК «Алые Паруса»"
          location="Каспийск · Турали-7"
          price="от 50 000 ₽"
          area="от 30 000 ₽"
          due="2028"
          index={1}
        />
      </Sequence>

      <Sequence from={TIMELINE.moscow.from} durationInFrames={TIMELINE.moscow.duration}>
        <ProjectScene
          image="moscow-2.jpg"
          badge="Город в городе"
          name="ЖК «Московский»"
          location="Махачкала · ул. Даганова"
          price="от 70 000 ₽"
          area="от 50 000 ₽"
          due="2027"
          index={2}
        />
      </Sequence>

      <Sequence from={TIMELINE.outro.from} durationInFrames={TIMELINE.outro.duration}>
        <Background />
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
