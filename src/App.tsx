/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import {
  FILM_FPS,
  FILM_DURATION,
  FILM_TOTAL_FRAMES,
  clamp,
} from './film/choreography';
import { createStudioScene, StudioSceneController } from './film/StudioScene';
import { TypographyOverlay } from './film/TypographyOverlay';
import { generateFilmAudioSamples } from './film/soundEngine';
import { DirectorDock } from './components/DirectorDock';
import { SpecModal } from './components/SpecModal';

declare global {
  interface Window {
    __setFilmTime?: (t: number) => void;
    __setFilmFrame?: (frame: number) => void;
    __getFilmCanvasDataURL?: () => string;
  }
}

export default function App() {
  // Check URL query parameters for deterministic headless rendering (?render=1&t=...)
  const searchParams = new URLSearchParams(window.location.search);
  const isRenderMode = searchParams.get('render') === '1';
  const initialTParam = searchParams.get('t');
  const initialFrameParam = searchParams.get('frame');

  const initialFrame = initialFrameParam
    ? clamp( parseInt(initialFrameParam, 10), 0, FILM_TOTAL_FRAMES - 1)
    : initialTParam
    ? clamp(Math.round(parseFloat(initialTParam) * FILM_FPS), 0, FILM_TOTAL_FRAMES - 1)
    : 0;

  const [currentFrame, setCurrentFrame] = useState<number>(initialFrame);
  const [currentTime, setCurrentTime] = useState<number>(initialFrame / FILM_FPS);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dofEnabled, setDofEnabled] = useState<boolean>(true);
  const [motionBlurEnabled, setMotionBlurEnabled] = useState<boolean>(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<StudioSceneController | null>(null);
  const dofRef = useRef<boolean>(true);
  const mbRef = useRef<boolean>(true);
  const playingRef = useRef<boolean>(false);
  const currentTimeRef = useRef<number>(initialFrame / FILM_FPS);

  // Web Audio API refs for synchronized browser playback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const playStartWallTimeRef = useRef<number>(0);
  const playStartOffsetRef = useRef<number>(0);

  dofRef.current = dofEnabled;
  mbRef.current = motionBlurEnabled;
  playingRef.current = isPlaying;

  const stopAudioSource = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
  }, []);

  const startAudioAt = useCallback(
    (offsetSec: number) => {
      if (isRenderMode || isMuted) return;
      try {
        if (!audioCtxRef.current) {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioCtx({ sampleRate: 48000 });
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        if (!audioBufferRef.current) {
          const pcm = generateFilmAudioSamples();
          const buf = ctx.createBuffer(2, pcm.left.length, pcm.sampleRate);
          buf.getChannelData(0).set(pcm.left);
          buf.getChannelData(1).set(pcm.right);
          audioBufferRef.current = buf;
        }
        stopAudioSource();
        const source = ctx.createBufferSource();
        source.buffer = audioBufferRef.current;
        const gain = ctx.createGain();
        gain.gain.value = isMuted ? 0 : 1;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0, clamp(offsetSec, 0, FILM_DURATION - 0.01));
        sourceNodeRef.current = source;
        gainNodeRef.current = gain;
      } catch {
        // Ignore audio context autoplay restrictions in headless mode
      }
    },
    [isMuted, isRenderMode, stopAudioSource]
  );

  // Initialize Three.js Studio Scene once
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || 1920;
    const h = mount.clientHeight || 1080;
    const ctrl = createStudioScene(mount, w, h);
    controllerRef.current = ctrl;

    // Initial deterministic draw
    ctrl.renderAtTime(currentTimeRef.current, {
      dof: dofRef.current,
      motionBlur: mbRef.current,
    });

    // Expose deterministic frame hooks for headless frame-by-frame capture
    window.__setFilmTime = (t: number) => {
      const clampedT = clamp(t, 0, FILM_DURATION);
      const f = Math.min(FILM_TOTAL_FRAMES - 1, Math.floor(clampedT * FILM_FPS));
      currentTimeRef.current = clampedT;
      flushSync(() => {
        setCurrentTime(clampedT);
        setCurrentFrame(f);
      });
      ctrl.renderAtTime(clampedT, {
        dof: dofRef.current,
        motionBlur: mbRef.current,
      });
    };

    window.__setFilmFrame = (frame: number) => {
      const f = clamp(Math.round(frame), 0, FILM_TOTAL_FRAMES - 1);
      const t = f / FILM_FPS;
      currentTimeRef.current = t;
      flushSync(() => {
        setCurrentFrame(f);
        setCurrentTime(t);
      });
      ctrl.renderAtTime(t, {
        dof: dofRef.current,
        motionBlur: mbRef.current,
      });
    };

    window.__getFilmCanvasDataURL = () => {
      return ctrl.getCanvas().toDataURL('image/png');
    };

    const handleResize = () => {
      if (!mount || !controllerRef.current) return;
      controllerRef.current.resize(mount.clientWidth || 1920, mount.clientHeight || 1080);
      controllerRef.current.renderAtTime(currentTimeRef.current, {
        dof: dofRef.current,
        motionBlur: mbRef.current,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      stopAudioSource();
      ctrl.dispose();
      controllerRef.current = null;
    };
  }, [stopAudioSource]);

  // Software-WebGL-safe playback loop (uses afterDraw fenceSync on SwiftShader)
  useEffect(() => {
    if (!isPlaying || isRenderMode) return;

    const ctrl = controllerRef.current;
    if (!ctrl) return;

    playStartWallTimeRef.current = performance.now();
    playStartOffsetRef.current = currentTimeRef.current >= FILM_DURATION - 0.05 ? 0 : currentTimeRef.current;
    startAudioAt(playStartOffsetRef.current);

    let timerId = 0;
    let rafId = 0;
    let cancelled = false;

    const afterDraw = (cb: () => void) => {
      const gl = ctrl.getCanvas().getContext('webgl2');
      if (!gl) {
        timerId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (cancelled) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 80);
        }
      };
      timerId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (cancelled) return;
      const elapsed = (performance.now() - playStartWallTimeRef.current) / 1000;
      const nextT = playStartOffsetRef.current + elapsed;

      if (nextT >= FILM_DURATION) {
        const endT = (FILM_TOTAL_FRAMES - 1) / FILM_FPS;
        currentTimeRef.current = endT;
        setCurrentTime(endT);
        setCurrentFrame(FILM_TOTAL_FRAMES - 1);
        setIsPlaying(false);
        stopAudioSource();
        ctrl.renderAtTime(endT, { dof: dofRef.current, motionBlur: mbRef.current });
        return;
      }

      const nextFrame = Math.min(FILM_TOTAL_FRAMES - 1, Math.floor(nextT * FILM_FPS));
      currentTimeRef.current = nextT;
      setCurrentTime(nextT);
      setCurrentFrame(nextFrame);
      ctrl.renderAtTime(nextT, { dof: dofRef.current, motionBlur: mbRef.current });

      if (ctrl.isSoftwareGl) {
        afterDraw(tick);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    if (ctrl.isSoftwareGl) {
      afterDraw(tick);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      stopAudioSource();
    };
  }, [isPlaying, isRenderMode, startAudioAt, stopAudioSource]);

  // Keyboard shortcuts (Space: Play/Pause, Left/Right Arrow: Step 1 Frame, H: Toggle Dock)
  useEffect(() => {
    if (isRenderMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        const nextF = Math.min(FILM_TOTAL_FRAMES - 1, currentFrame + 1);
        window.__setFilmFrame?.(nextF);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        const prevF = Math.max(0, currentFrame - 1);
        window.__setFilmFrame?.(prevF);
      } else if (e.code === 'KeyH') {
        setIsDockCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentFrame, isRenderMode]);

  const handleSeekFrame = useCallback((frame: number) => {
    setIsPlaying(false);
    window.__setFilmFrame?.(frame);
  }, []);

  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    window.__setFilmFrame?.(0);
    setTimeout(() => setIsPlaying(true), 30);
  }, []);

  const handleToggleDof = useCallback(() => {
    setDofEnabled((prev) => {
      const next = !prev;
      dofRef.current = next;
      controllerRef.current?.renderAtTime(currentTimeRef.current, {
        dof: next,
        motionBlur: mbRef.current,
      });
      return next;
    });
  }, []);

  const handleToggleMotionBlur = useCallback(() => {
    setMotionBlurEnabled((prev) => {
      const next = !prev;
      mbRef.current = next;
      controllerRef.current?.renderAtTime(currentTimeRef.current, {
        dof: dofRef.current,
        motionBlur: next,
      });
      return next;
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = next ? 0 : 1;
      }
      return next;
    });
  }, []);

  return (
    <main
      className="relative w-full h-full overflow-hidden bg-[#f8edf2]"
      data-frame={currentFrame}
      data-time={currentTime.toFixed(3)}
    >
      {/* Dedicated Isolated WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        data-testid="studio-canvas-mount"
        className="w-full h-full"
      />

      {/* Deterministic Editorial Kinetic Typography Overlay */}
      <TypographyOverlay
        time={currentTime}
        dockClearance={!isRenderMode && !isDockCollapsed}
      />

      {/* Interactive Director Controls (Hidden during headless frame render mode ?render=1) */}
      {!isRenderMode && (
        <>
          <DirectorDock
            currentFrame={currentFrame}
            isPlaying={isPlaying}
            isMuted={isMuted}
            dofEnabled={dofEnabled}
            motionBlurEnabled={motionBlurEnabled}
            isCollapsed={isDockCollapsed}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onRestart={handleRestart}
            onSeekFrame={handleSeekFrame}
            onToggleMute={handleToggleMute}
            onToggleDof={handleToggleDof}
            onToggleMotionBlur={handleToggleMotionBlur}
            onToggleCollapse={() => setIsDockCollapsed((c) => !c)}
            onOpenSpecModal={() => setIsSpecModalOpen(true)}
          />

          <SpecModal
            isOpen={isSpecModalOpen}
            onClose={() => setIsSpecModalOpen(false)}
            onSelectFrame={handleSeekFrame}
          />
        </>
      )}
    </main>
  );
}
