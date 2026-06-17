# Higgsfield — пакет промптов для VetraEstate

Цель: оживить фоны ЖК (люди ходят, машины едут, вода и свет живут) и сделать
настоящий переход день→ночь. Генерируете клипы в Higgsfield → присылаете мне →
я встраиваю их в hero вместо статичных фото (с постером-заглушкой и фоллбэком).

## Технические требования к клипам (важно для сайта)

- **Тип**: Image-to-Video (загружаете готовый рендер ЖК как первый кадр).
- **Длительность**: 5–8 секунд, движение **зацикливаемое** (seamless loop) —
  камеру держать почти статичной, чтобы конец совпадал с началом.
- **Камера**: для hero — «locked / very slow push-in». Сильные пролёты только
  для отдельного ролика-облёта (не для фонового цикла).
- **Форматы**: по 2 версии каждого клипа
  - Десктоп — **16:9, 1920×1080**
  - Мобайл — **9:16, 1080×1920**
- **Экспорт**: MP4 (H.264), без звука.
- **Имена файлов** (чтобы встали автоматически):
  - `hero-horizon-day-d.mp4` / `-m.mp4`, `hero-horizon-night-d.mp4` / `-m.mp4`
  - `hero-moscow-day-*.mp4`, `hero-moscow-night-*.mp4`
  - `hero-alye-day-*.mp4`, `hero-alye-night-*.mp4`

---

## 1. ЖК «Новый Горизонт» — аэросъёмка кварталов

**День (живая петля):**
> Aerial view of a modern residential complex with red-brick mid-rise buildings
> and green courtyards. Subtle life: a few cars slowly driving along the streets,
> tiny pedestrians walking on the paths, trees and bushes gently swaying in the
> breeze, soft clouds drifting across a clear daytime sky, light shimmering.
> Camera almost static, very slow subtle push-in. Photorealistic, seamless loop.

**Вечер/ночь:**
> Same aerial residential complex at night. Warm window lights glowing and softly
> flickering across the buildings, street lamps lit, car headlights and red
> taillights moving along the roads, gentle reflections on wet asphalt, deep blue
> night sky with faint stars. Camera almost static. Photorealistic, seamless loop.

## 2. ЖК «Московский» — плотная застройка, школа и стадион

**День:**
> Aerial view of a large modern residential district with beige and brick towers,
> inner courtyards, a school and a green sports stadium. Cars moving along the
> avenues, people walking in the yards and near the school, players on the
> stadium field, trees swaying, clouds drifting. Camera nearly static, very slow
> push-in. Photorealistic, seamless loop.

**Вечер/ночь:**
> Same district at dusk turning to night. Thousands of warm apartment windows
> lighting up, illuminated stadium floodlights, street lighting along avenues,
> car headlights flowing through the streets, calm blue evening sky. Camera
> almost static. Photorealistic, seamless loop.

## 3. АК «Алые Паруса» — у моря, бассейн и пляж

**День:**
> Aerial view of a seaside apartment complex with a long turquoise pool, sandy
> beach and promenade. Pool water gently rippling, sea waves rolling onto the
> shore, people strolling along the promenade and around the pool, palm trees and
> greenery swaying in the sea breeze, light clouds drifting. Camera nearly static,
> slow push-in. Golden-hour light. Photorealistic, seamless loop.

**Вечер/ночь:**
> Same seaside complex at night. Pool glowing bright turquoise, warm facade and
> balcony lights, promenade lamps lit, gentle dark sea waves with moonlight
> reflections, faint stars in the sky. A few people walking. Camera almost
> static. Photorealistic, seamless loop.

---

## 4. (Опционально) Настоящий переход день→ночь

Для каждого ЖК один клип-таймлапс ~6 c:
> Time-lapse of the residential complex transitioning from golden-hour daylight
> to night: the sun setting, sky shifting from warm orange to deep blue, window
> lights gradually turning on across the buildings, street lamps igniting, cars
> appearing with headlights. Smooth cinematic time-lapse, camera locked,
> photorealistic.

(Если сделаете такие — переход на сайте станет фотореалистичным вместо
кроссфейда между двумя фото.)

## 5. (Опционально) Кинематографичный облёт для отдельной секции

> Cinematic drone fly-through over the residential complex: smooth orbit and
> push-in revealing facades, courtyards and the waterfront, golden-hour light,
> filmic depth of field. 8–10 seconds, high detail, photorealistic.

Формат 16:9, без зацикливания (это «ролик-облёт», не фон).

---

## Что я сделаю после получения клипов

1. Сожму и оптимизирую под веб (вес, постер-кадр = текущее фото-фоллбэк).
2. Заменю фоновые фото hero на `<video autoplay muted loop playsinline>` с
   постером; на медленном соединении и при «уменьшить движение» останется фото.
3. Подключу переключатель ЖК и день/вечер к видео так же, как сейчас к фото.
4. При наличии таймлапсов — сделаю настоящий переход день→ночь.
