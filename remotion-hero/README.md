# Remotion hero — живой фон АК «Алые Паруса»

Анимированный фоновый видео-loop для hero: движение камеры, дышащее свечение
окон, мерцание бассейна и световые росчерки машин вдоль дороги. Сделан
бесшовным циклом (8 c, 30 fps, 1280×720) — кадр 0 совпадает с последним.

Готовый ролик уже лежит в сайте: `images/alye-hero.mp4`.

## Как пересобрать

```bash
cd remotion-hero
npm i
npx remotion studio          # предпросмотр
npx remotion render AlyeHero out/alye-hero.mp4 --codec=h264 --crf=23
cp out/alye-hero.mp4 ../images/alye-hero.mp4
```

Исходный рендер ЖК — `public/alye-night.jpg` (= `images/hero-alye-night-d.jpg`).

> В средах без доступа к `remotion.media` укажите путь к локальному Chromium:
> `--browser-executable=$(find ~/.cache/puppeteer -name chrome-headless-shell -type f | head -1)`
