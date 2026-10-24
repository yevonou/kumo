import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sliders,
  Film,
  Download,
} from 'lucide-react';
import {
  FILM_FPS,
  FILM_TOTAL_FRAMES,
  KEYFRAME_PRESETS,
  CUE_SHEET,
} from '../film/choreography';

interface DirectorDockProps {
  currentFrame: number;
  isPlaying: boolean;
  isMuted: boolean;
  dofEnabled: boolean;
  motionBlurEnabled: boolean;
  isCollapsed: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  onSeekFrame: (frame: number) => void;
  onToggleMute: () => void;
  onToggleDof: () => void;
  onToggleMotionBlur: () => void;
  onToggleCollapse: () => void;
  onOpenSpecModal: () => void;
}

export const DirectorDock: React.FC<DirectorDockProps> = ({
  currentFrame,
  isPlaying,
  isMuted,
  dofEnabled,
  motionBlurEnabled,
  isCollapsed,
  onTogglePlay,
  onRestart,
  onSeekFrame,
  onToggleMute,
  onToggleDof,
  onToggleMotionBlur,
  onToggleCollapse,
  onOpenSpecModal,
}) => {
  const currentTime = currentFrame / FILM_FPS;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[94vw] max-w-[960px] flex flex-col items-center pointer-events-none"
      role="region"
      aria-label="Director Timeline & Studio Controls"
    >
      {/* Collapse / Expand Tab */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-expanded={!isCollapsed}
        className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1 rounded-t-lg bg-[#241328] text-[#f5e8f2] text-xs font-medium border border-b-0 border-[#4a2b52] hover:bg-[#311b36] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-[#ff7592]" />
            <span>Show Controls</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-[#ff7592]" />
            <span>Hide Controls</span>
          </>
        )}
      </button>

      {/* Main Dock Panel (Solid dark plum surface — no backdrop-filter over WebGL) */}
      {!isCollapsed && (
        <div className="pointer-events-auto w-full rounded-xl bg-[#201024] text-[#f8edf4] border border-[#4a2b52] shadow-2xl px-4 py-3 flex flex-col gap-2.5">
          {/* Row 1: Scrubber + Cue Markers */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="frame-scrubber"
              className="text-[11px] font-mono text-[#d4b8d9] tabular-nums whitespace-nowrap shrink-0"
            >
              F {String(currentFrame).padStart(3, '0')} / 239 · {currentTime.toFixed(2)}s
            </label>

            <div className="relative flex-1 flex items-center">
              <input
                id="frame-scrubber"
                type="range"
                min={0}
                max={FILM_TOTAL_FRAMES - 1}
                step={1}
                value={currentFrame}
                onChange={(e) => onSeekFrame(Number(e.target.value))}
                aria-label="Film frame scrubber"
                className="w-full h-1.5 bg-[#3c2142] rounded-lg appearance-none cursor-pointer accent-[#ff7592]"
              />
              {/* Subtle Cue Sheet Onset Ticks */}
              <div className="pointer-events-none absolute inset-x-0 -bottom-1.5 flex justify-between">
                {CUE_SHEET.map((cue) => {
                  const pct = (cue.frame / (FILM_TOTAL_FRAMES - 1)) * 100;
                  return (
                    <span
                      key={cue.id}
                      style={{ left: `${pct}%` }}
                      className={`absolute w-0.5 h-1 ${
                        cue.type === 'hero_impact' ? 'bg-[#ff4d79] h-1.5' : 'bg-[#a87eb0]/60'
                      }`}
                      title={`${cue.label} (${cue.time.toFixed(2)}s)`}
                    />
                  );
                })}
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#b896bf] tabular-nums whitespace-nowrap shrink-0 hidden sm:inline">
              24.000 FPS · 10.000s
            </span>
          </div>

          {/* Row 2: Transport + Keyframe Stills + Render Passes */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#3b2042]">
            {/* Left Transport Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onTogglePlay}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#ff6b8b] hover:bg-[#ff5277] text-[#1f0d24] font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play Film'}</span>
              </button>

              <button
                type="button"
                onClick={onRestart}
                aria-label="Restart film from frame 0"
                className="p-1.5 rounded-lg bg-[#311a37] hover:bg-[#41244a] text-[#ecd8f0] transition-colors cursor-pointer"
                title="Restart (Frame 0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Unmute ASMR audio' : 'Mute ASMR audio'}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#311a37] hover:bg-[#41244a] text-[#ecd8f0] text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-[#ff8da1]" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-[#a8e6cf]" />
                )}
                <span className="hidden md:inline">{isMuted ? 'Muted' : 'ASMR Audio'}</span>
              </button>
            </div>

            {/* Center 8 Keyframe Still Jump Buttons */}
            <div
              className="flex items-center gap-1 overflow-x-auto py-0.5"
              role="group"
              aria-label="Keyframe Still Presets"
            >
              {KEYFRAME_PRESETS.map((kf, idx) => {
                const isActive = Math.abs(currentFrame - kf.frame) <= 3;
                return (
                  <button
                    key={kf.id}
                    type="button"
                    onClick={() => onSeekFrame(kf.frame)}
                    title={`${kf.zhTitle} — ${kf.caption}`}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#f8edf4] text-[#201024] font-semibold'
                        : 'bg-[#2c1732] text-[#d4b8d9] hover:bg-[#3c2144]'
                    }`}
                  >
                    K{idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Right Optical Pass Toggles & Cue Sheet Modal */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleDof}
                aria-pressed={dofEnabled}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  dofEnabled
                    ? 'bg-[#3d2346] text-[#ffd1dc] border border-[#ff7592]/40'
                    : 'bg-[#2a1630] text-[#9a7ca1]'
                }`}
              >
                f/1.8 DOF
              </button>

              <button
                type="button"
                onClick={onToggleMotionBlur}
                aria-pressed={motionBlurEnabled}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  motionBlurEnabled
                    ? 'bg-[#3d2346] text-[#d4c4ff] border border-[#c8b6ff]/40'
                    : 'bg-[#2a1630] text-[#9a7ca1]'
                }`}
              >
                Motion Blur
              </button>

              <button
                type="button"
                onClick={onOpenSpecModal}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#311a37] hover:bg-[#42254b] text-[#f5e8f2] text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#ff7592]" />
                <span>Cue Sheet</span>
              </button>

              <a
                href="/video.mp4"
                download="video.mp4"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#311a37] hover:bg-[#42254b] text-[#a8e6cf] text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                title="Download Mastered 1080p24 MP4"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">video.mp4</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
