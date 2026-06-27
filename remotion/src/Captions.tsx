import {useCallback, useEffect, useState} from 'react';
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  Caption,
  createTikTokStyleCaptions,
  TikTokPage,
} from '@remotion/captions';
import {loadFont} from '@remotion/google-fonts/BebasNeue';
import {BRAND} from './clips';

const {fontFamily} = loadFont();

// Tokens within this gap are grouped onto the same on-screen page.
const COMBINE_MS = 1200;

export const Captions: React.FC<{src: string}> = ({src}) => {
  const [handle] = useState(() => delayRender('Loading captions'));
  const [pages, setPages] = useState<TikTokPage[] | null>(null);

  const fetchCaptions = useCallback(async () => {
    try {
      const res = await fetch(staticFile(src));
      if (!res.ok) {
        // No caption file for this clip (e.g. transcription not run): render none.
        setPages([]);
        continueRender(handle);
        return;
      }
      const captions = (await res.json()) as Caption[];
      const {pages: built} = createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: COMBINE_MS,
      });
      setPages(built);
      continueRender(handle);
    } catch (err) {
      cancelRender(err);
    }
  }, [handle, src]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  if (!pages) {
    return null;
  }

  return (
    <AbsoluteFill>
      {pages.map((page, i) => (
        <CaptionPage key={i} page={page} fontFamily={fontFamily} />
      ))}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{page: TikTokPage; fontFamily: string}> = ({
  page,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const vw = width / 100;
  const nowMs = (frame / fps) * 1000;

  // Page is visible from its start until the next page starts (or clip end).
  const pageEndMs = page.startMs + page.durationMs;
  if (nowMs < page.startMs || nowMs > pageEndMs + 400) {
    return null;
  }

  // Subtle pop-in on the page.
  const sinceStart = nowMs - page.startMs;
  const appear = Math.min(1, Math.max(0, sinceStart / 120));

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: vw * 12,
      }}
    >
      <div
        style={{
          maxWidth: '86%',
          textAlign: 'center',
          fontFamily,
          fontSize: vw * 6.5,
          lineHeight: 1.05,
          letterSpacing: 1,
          textTransform: 'uppercase',
          transform: `scale(${0.92 + appear * 0.08})`,
        }}
      >
        {page.tokens.map((token, i) => {
          const active = nowMs >= token.fromMs && nowMs <= token.toMs;
          return (
            <span
              key={i}
              style={{
                color: active ? BRAND.accent : 'white',
                margin: '0 0.18em',
                display: 'inline-block',
                WebkitTextStroke: `${vw * 0.22}px black`,
                paintOrder: 'stroke fill',
                textShadow: '0 4px 18px rgba(0,0,0,0.55)',
                transform: active ? 'translateY(-2%)' : 'none',
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
