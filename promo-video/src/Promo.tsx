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
          image="horizon-5.jpeg"
          badge="Продажи идут"
          name="ЖК «Горизонт»"
          location="Махачкала · Ленинский район"
          price="от 4,2 млн ₽"
          area="36–95 м²"
          due="Q2 2025"
          index={0}
        />
      </Sequence>

      <Sequence from={TIMELINE.alye.from} durationInFrames={TIMELINE.alye.duration}>
        <ProjectScene
          image="alye-photo-5.jpg"
          badge="Первая линия у моря"
          name="ЖК «Алые Паруса»"
          location="Каспийск · набережная"
          price="от 5,8 млн ₽"
          area="48–120 м²"
          due="Q4 2025"
          index={1}
        />
      </Sequence>

      <Sequence from={TIMELINE.moscow.from} durationInFrames={TIMELINE.moscow.duration}>
        <ProjectScene
          image="moscow-photo-2.jpg"
          badge="Последние квартиры"
          name="ЖК «Московский»"
          location="Махачкала · Московский пр-т"
          price="от 3,5 млн ₽"
          area="32–85 м²"
          due="Q1 2025"
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
