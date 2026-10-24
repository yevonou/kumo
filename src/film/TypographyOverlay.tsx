import React from 'react';
import {
  c4dLongTailEase,
  clamp,
  smoothstep,
  HERO_DROP_TIMES,
  evaluateCamera,
} from './choreography';

interface TypographyOverlayProps {
  time: number;
  dockClearance?: boolean;
}

const FONT_SANS = '"Plus Jakarta Sans", "Noto Sans SC", sans-serif';
const FONT_DISPLAY = '"Outfit", "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
const FONT_MONO = '"JetBrains Mono", "Noto Sans SC", sans-serif';

/**
 * Deterministic Kinetic Typography & Swiss Editorial Grid Overlay.
 * Every position, clip, tracking, and opacity is a pure closed-form function of time `t`.
 * Enforces ~5.5% safe margins, proper CJK punctuation, and high-contrast editorial hierarchy.
 */
export const TypographyOverlay: React.FC<TypographyOverlayProps> = ({
  time: t,
  dockClearance = false,
}) => {
  const cam = evaluateCamera(t);

  // Determine current Act title in idiomatic Chinese & English
  let actCode = 'ACT I · 01';
  let actZh = '第一幕 · 阵列苏醒';
  let actEn = 'CLONER AWAKENING';
  if (t >= 1.58 && t < 5.45) {
    actCode = 'ACT II · 02';
    actZh = '第二幕 · 凝脂坠落';
    actEn = 'ELASTIC COLLISION';
  } else if (t >= 5.45 && t < 7.75) {
    actCode = 'ACT III · 03';
    actZh = '第三幕 · 柔体共振';
    actEn = 'PLUSH SHOCKWAVE';
  } else if (t >= 7.75) {
    actCode = 'ACT IV · 04';
    actZh = '第四幕 · 万物归柔';
    actEn = 'HERO RESOLVE';
  }

  // Header entrance ease (instant visibility from Frame 0 — hook in first 0.1s)
  const headerAlpha = smoothstep(0.0, 0.15, t);

  // Beat 1: Opening Cloner Wave Editorial Block (0.00s - 1.55s)
  const beat1Enter = c4dLongTailEase(clamp((t + 0.08) / 0.42, 0, 1));
  const beat1Exit = 1.0 - smoothstep(1.32, 1.56, t);
  const beat1Alpha = beat1Enter * beat1Exit;
  const beat1Y = (1.0 - beat1Enter) * 16 - (1.0 - beat1Exit) * 12;

  // Beat 2: Staggered Letter Drop Callouts (1.85s - 3.85s)
  const beat2Exit = 1.0 - smoothstep(3.55, 3.85, t);
  const dropCallouts = [
    { char: 'S', zh: '次表面散射软胶', en: 'SSS Candy Silicone', dropT: HERO_DROP_TIMES[0] },
    { char: 'O', zh: '体积守恒挤压回弹', en: 'Volume-Preserving Squash', dropT: HERO_DROP_TIMES[1] },
    { char: 'F', zh: '柔光釉面与虹彩玻璃', en: 'Glazed Ceramic & Dichroic', dropT: HERO_DROP_TIMES[2] },
    { char: 'T', zh: '阻尼弹簧柔体动力学', en: 'Damped Spring Dynamics', dropT: HERO_DROP_TIMES[3] },
  ];

  // Beat 3: Orbital & Zero-G Anticipation Statement (3.90s - 6.20s)
  const beat3Enter = c4dLongTailEase(clamp((t - 3.88) / 0.65, 0, 1));
  const beat3Exit = 1.0 - smoothstep(5.98, 6.22, t);
  const beat3Alpha = beat3Enter * beat3Exit;
  const beat3Y = (1.0 - beat3Enter) * 16 - (1.0 - beat3Exit) * 12;

  // Beat 4: Hero Moment Shockwave Callout (6.24s - 7.75s)
  const beat4Enter = c4dLongTailEase(clamp((t - 6.23) / 0.42, 0, 1));
  const beat4Exit = 1.0 - smoothstep(7.45, 7.78, t);
  const beat4Alpha = beat4Enter * beat4Exit;
  const beat4Scale = 0.95 + 0.05 * beat4Enter;

  // Beat 5: Composed End Frame Hero Brand Lockup (7.80s - 10.00s, held > 1.2s)
  const beat5Enter = c4dLongTailEase(clamp((t - 7.78) / 0.85, 0, 1));
  const beat5Alpha = beat5Enter;
  const beat5Y = (1.0 - beat5Enter) * 20;

  const frameNumber = Math.min(239, Math.floor(t * 24));
  const timecodeSec = Math.floor(t);
  const timecodeFrames = frameNumber % 24;
  const formattedTC = `00:00:${String(timecodeSec).padStart(2, '0')}:${String(timecodeFrames).padStart(2, '0')}`;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ fontFamily: FONT_SANS }}
    >
      {/* Subtle Top & Bottom Pastel Studio Scrims for 100% Editorial Legibility */}
      <div
        className="absolute inset-x-0 top-0 h-28"
        style={{
          background:
            'linear-gradient(to bottom, rgba(249, 239, 244, 0.90) 0%, rgba(249, 239, 244, 0.48) 58%, rgba(249, 239, 244, 0.0) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{
          background:
            'linear-gradient(to top, rgba(249, 239, 244, 0.94) 0%, rgba(249, 239, 244, 0.72) 52%, rgba(249, 239, 244, 0.0) 100%)',
        }}
      />

      {/* 5.5% Broadcast Safe Margin Container */}
      <div className="relative w-full h-full px-[5.5%] py-[4.6%] flex flex-col justify-between">
        {/* TOP EDITORIAL STRIP */}
        <div
          className="flex items-center justify-between border-b border-[#3a2238]/15 pb-3"
          style={{ opacity: headerAlpha }}
        >
          {/* Top-Left Brand Monogram */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-[15px] font-extrabold tracking-[0.14em] text-[#241126]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              KUMO·SOFT°
            </span>
            <span className="text-[12px] text-[#5e3d5c]/70">·</span>
            <span className="text-[13px] font-semibold tracking-[0.08em] text-[#3d2140]">
              云沫造物 — 触感视觉志
            </span>
          </div>

          {/* Top-Center Chapter / Act Indicator */}
          <div className="hidden sm:flex items-center gap-2.5 text-[12px] tracking-[0.08em] text-[#3d2140]">
            <span
              className="font-semibold text-[#c42f5c]"
              style={{ fontFamily: FONT_MONO }}
            >
              {actCode}
            </span>
            <span className="text-[#4a2c49]/40">/</span>
            <span className="font-semibold">{actZh}</span>
            <span className="text-[#4a2c49]/40">·</span>
            <span
              className="text-[11px] uppercase tracking-[0.14em] text-[#563558]"
              style={{ fontFamily: FONT_MONO }}
            >
              {actEn}
            </span>
          </div>

          {/* Top-Right Optical & Frame Telemetry */}
          <div
            className="flex items-center gap-3 text-[11px] tracking-[0.08em] text-[#3d2140] tabular-nums"
            style={{ fontFamily: FONT_MONO }}
          >
            <span>f/{cam.aperture.toFixed(1)} MACRO</span>
            <span className="text-[#4a2c49]/35">·</span>
            <span>FOCUS {cam.focusDistance.toFixed(1)}m</span>
            <span className="text-[#4a2c49]/35">·</span>
            <span className="font-semibold text-[#221024]">{formattedTC}</span>
          </div>
        </div>

        {/* MIDDLE / LOWER-THIRD KINETIC EDITORIAL SUPER-TITLES */}
        <div
          className={`relative flex-1 flex flex-col justify-end ${
            dockClearance ? 'pb-20' : 'pb-1'
          }`}
        >
          {/* BEAT 1: Opening Cloner Wave (0.00s - 1.55s) */}
          {beat1Alpha > 0.005 && (
            <div
              className="max-w-xl"
              style={{
                opacity: beat1Alpha,
                transform: `translate3d(0, ${beat1Y.toFixed(2)}px, 0)`,
              }}
            >
              <div
                className="text-[11px] font-semibold tracking-[0.14em] text-[#c42f5c] mb-1"
                style={{ fontFamily: FONT_MONO }}
              >
                01 / MOGRAPH CLONER WAVE · 克隆阵列波涌
              </div>
              <h2 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.01em] text-[#221024] leading-[1.18]">
                秩序与波涌的微妙触感。
              </h2>
              <p className="mt-1 text-[13px] font-medium tracking-[0.03em] text-[#3d2240]">
                165 枚次表面散射软胶、柔光陶瓷与磨砂玻璃单元，由正弦效果器精密驱动。
              </p>
            </div>
          )}

          {/* BEAT 2: Staggered S-O-F-T Drop Callouts (1.85s - 3.85s) */}
          {t >= 1.85 && t <= 3.9 && beat2Exit > 0.005 && (
            <div
              className="grid grid-cols-4 gap-5 pt-3 border-t border-[#3a2238]/15"
              style={{ opacity: beat2Exit }}
            >
              {dropCallouts.map((item, idx) => {
                const localEnter = c4dLongTailEase(clamp((t - (item.dropT - 0.08)) / 0.35, 0, 1));
                const isJustHit = t >= item.dropT && t <= item.dropT + 0.28;
                return (
                  <div
                    key={item.char}
                    style={{
                      opacity: localEnter,
                      transform: `translate3d(0, ${((1 - localEnter) * 14).toFixed(1)}px, 0)`,
                    }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-[20px] font-extrabold tracking-tight"
                        style={{
                          fontFamily: FONT_DISPLAY,
                          color: isJustHit ? '#d92658' : '#221024',
                        }}
                      >
                        0{idx + 1} · {item.char}
                      </span>
                      <span
                        className="text-[11px] font-medium text-[#5a375d] tabular-nums"
                        style={{ fontFamily: FONT_MONO }}
                      >
                        {item.dropT.toFixed(2)}s
                      </span>
                    </div>
                    <div className="text-[13px] font-bold text-[#261229] mt-0.5">
                      {item.zh}
                    </div>
                    <div className="text-[11px] font-medium text-[#4e3052] tracking-[0.02em]">
                      {item.en}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BEAT 3: Orbital & Anti-Gravity Anticipation (3.88s - 6.22s) */}
          {beat3Alpha > 0.005 && (
            <div
              className="flex items-end justify-between border-t border-[#3a2238]/12 pt-3"
              style={{
                opacity: beat3Alpha,
                transform: `translate3d(0, ${beat3Y.toFixed(2)}px, 0)`,
              }}
            >
              <div>
                <div
                  className="text-[11px] font-semibold tracking-[0.14em] text-[#c42f5c] mb-1"
                  style={{ fontFamily: FONT_MONO }}
                >
                  02 / ZERO-G ANTICIPATION · 反重力聚拢蓄势
                </div>
                <h2 className="text-[26px] sm:text-[32px] font-bold text-[#221024] tracking-[-0.01em] leading-[1.2]">
                  当重力凝结为柔韧的张力——
                </h2>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-[13px] font-bold text-[#2a152d]">
                  质感三件套：SSS 软胶 · 柔光陶瓷 · 虹彩磨砂玻璃
                </div>
                <div className="text-[11px] font-medium text-[#4e3052] mt-0.5">
                  Subsurface Scattering · Ambient Occlusion · Softbox HDRI
                </div>
              </div>
            </div>
          )}

          {/* BEAT 4: HERO MOMENT Climax Shockwave (6.23s - 7.78s) */}
          {beat4Alpha > 0.005 && (
            <div
              className="flex items-end justify-between border-t border-[#3a2238]/15 pt-3"
              style={{
                opacity: beat4Alpha,
                transform: `scale(${beat4Scale.toFixed(4)})`,
                transformOrigin: 'left bottom',
              }}
            >
              <div>
                <div
                  className="text-[11px] font-bold tracking-[0.15em] text-[#c42f5c] mb-1"
                  style={{ fontFamily: FONT_MONO }}
                >
                  03 / HERO IMPACT @ 06.25S · 凝脂核心碰撞冲击波
                </div>
                <h2 className="text-[28px] sm:text-[35px] font-extrabold text-[#1e0d20] tracking-[-0.015em] leading-[1.15]">
                  瞬时形变，全域软体波浪共振。
                </h2>
              </div>
              <div
                className="text-right text-[11px] font-semibold text-[#3d2140] tabular-nums hidden sm:block"
                style={{ fontFamily: FONT_MONO }}
              >
                <div>VOLUME PRESERVATION: sx · sy · sz = 1.000</div>
                <div>RADIAL WAVE VELOCITY: 5.60 UNITS/S</div>
              </div>
            </div>
          )}

          {/* BEAT 5: Composed End Frame Brand Identity Lockup (7.78s - 10.00s) */}
          {beat5Alpha > 0.005 && (
            <div
              className="flex flex-col sm:flex-row sm:items-end justify-between border-t border-[#3a2238]/20 pt-3"
              style={{
                opacity: beat5Alpha,
                transform: `translate3d(0, ${beat5Y.toFixed(2)}px, 0)`,
              }}
            >
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[28px] sm:text-[34px] font-extrabold tracking-[0.06em] text-[#1e0d20]"
                    style={{ fontFamily: FONT_DISPLAY }}
                  >
                    KUMO·SOFT°
                  </span>
                  <span className="text-[18px] text-[#c42f5c] font-light">/</span>
                  <span className="text-[22px] sm:text-[26px] font-bold tracking-[0.08em] text-[#241126]">
                    云沫造物
                  </span>
                </div>
                <p className="text-[14px] font-semibold tracking-[0.05em] text-[#351b38] mt-0.5">
                  柔软即力量，触感即语言。 · <span className="text-[#56335a]">Soft &amp; Satisfying Tactile Identity</span>
                </p>
              </div>

              <div className="mt-2 sm:mt-0 sm:text-right">
                <div
                  className="text-[11px] font-semibold tracking-[0.12em] text-[#2a152d]"
                  style={{ fontFamily: FONT_MONO }}
                >
                  LONG-TAIL EASE 80/20 · 24.000 FPS · 1920×1080
                </div>
                <div className="text-[12px] font-medium text-[#4a2c49] mt-0.5">
                  京都 · 上海 · 赫尔辛基 — 感官工业设计实验室
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
