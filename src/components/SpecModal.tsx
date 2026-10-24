import React from 'react';
import { X, Film, Music, Sparkles } from 'lucide-react';
import { CUE_SHEET, KEYFRAME_PRESETS } from '../film/choreography';

interface SpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFrame: (frame: number) => void;
}

export const SpecModal: React.FC<SpecModalProps> = ({
  isOpen,
  onClose,
  onSelectFrame,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-modal-title"
    >
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#1e0f22] text-[#f6ebf3] border border-[#4a2b52] shadow-2xl p-6">
        <div className="flex items-start justify-between border-b border-[#3b2042] pb-4">
          <div>
            <h2
              id="spec-modal-title"
              className="text-xl font-bold tracking-tight text-white"
              style={{ fontFamily: '"Outfit", "Noto Sans SC", sans-serif' }}
            >
              KUMO·SOFT° · 云沫造物 — Director’s Treatment &amp; Cue Sheet
            </h2>
            <p className="text-xs text-[#cbb0d0] mt-1">
              1920×1080 · 24.000 fps · 10.000s (240 Frames) · Mastered Stereo Audio (−14.0 LUFS / ≤ −1.0 dBTP)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Cue Sheet Modal"
            className="p-1.5 rounded-lg bg-[#311a37] hover:bg-[#46264f] text-[#f6ebf3] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Treatment & Signature Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 text-xs leading-relaxed">
          <div className="p-4 rounded-xl bg-[#29152e] border border-[#3e2246]">
            <div className="flex items-center gap-1.5 font-semibold text-[#ff8da1] mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>C4D / Octane Signature Features</span>
            </div>
            <ul className="space-y-1 text-[#e3cfe7]">
              <li>· MoGraph Cloner Field: 165-element array with Sine, Plain &amp; Radial Effectors</li>
              <li>· Material Trio: Custom Octane SSS Gummy, Glazed Ceramic, Dichroic Frosted Glass &amp; Chrome</li>
              <li>· Soft-Body Squash &amp; Stretch: Volume-preserving (sx·sy·sz = 1) damped spring dynamics</li>
              <li>· Long-Tail Ease Camera: 80% travel in first 20% + f/1.8 Golden-Angle Bokeh DOF</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#29152e] border border-[#3e2246]">
            <div className="flex items-center gap-1.5 font-semibold text-[#a8e6cf] mb-1.5">
              <Music className="w-3.5 h-3.5" />
              <span>ASMR Sound Design &amp; Mastering</span>
            </div>
            <ul className="space-y-1 text-[#e3cfe7]">
              <li>· Minnaert Acoustic Bubble Pops &amp; Domino Silicone Clicks</li>
              <li>· Rounded Sub-Bass Soft Thuds + Formant Jelly Squishes on every drop</li>
              <li>· Fmaj9 → Bbmaj9#11 → C13sus4 → Cmaj9#11 Airy Pastel Pad &amp; Glass Chimes</li>
              <li>· Frame-accurate synchronization reading from the unified CUE_SHEET</li>
            </ul>
          </div>
        </div>

        {/* Keyframe Stills Jump List */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d4b8d9] mb-2.5 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-[#ff7592]" />
            <span>8 Canonical Keyframe Stills (Click to Inspect Frame)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {KEYFRAME_PRESETS.map((kf) => (
              <button
                key={kf.id}
                type="button"
                onClick={() => {
                  onSelectFrame(kf.frame);
                  onClose();
                }}
                className="text-left p-2.5 rounded-lg bg-[#29152e] hover:bg-[#381d3f] border border-[#3e2246] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>{kf.zhTitle}</span>
                  <span className="font-mono text-[11px] text-[#ff8da1] tabular-nums">
                    F{String(kf.frame).padStart(3, '0')} · {kf.time.toFixed(2)}s
                  </span>
                </div>
                <div className="text-[11px] text-[#c3a5c8] mt-0.5">{kf.caption}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Unified Picture & Sound Cue Sheet Table */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d4b8d9] mb-2">
            Unified Picture &amp; Sound Cue Sheet (24.000 fps)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-[#3e2246]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#2a1530] text-[#d4b8d9] border-b border-[#3e2246]">
                  <th className="py-2 px-3 font-medium">Time (s)</th>
                  <th className="py-2 px-3 font-medium">Frame</th>
                  <th className="py-2 px-3 font-medium">Cue Event (ZH / EN)</th>
                  <th className="py-2 px-3 font-medium text-right">Freq / Pan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#331b3a] tabular-nums">
                {CUE_SHEET.map((cue) => (
                  <tr
                    key={cue.id}
                    onClick={() => {
                      onSelectFrame(cue.frame);
                      onClose();
                    }}
                    className="hover:bg-[#2f1836] cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-mono text-[#ff8da1]">
                      {cue.time.toFixed(2)}s
                    </td>
                    <td className="py-2 px-3 font-mono text-[#cbb0d0]">
                      #{String(cue.frame).padStart(3, '0')}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-white">{cue.zhLabel}</div>
                      <div className="text-[11px] text-[#b896bf]">{cue.label}</div>
                    </td>
                    <td className="py-2 px-3 font-mono text-right text-[#a8e6cf]">
                      {Math.round(cue.pitchHz)}Hz · {cue.pan >= 0 ? `R+${cue.pan}` : `L${cue.pan}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
