import React, { useEffect, useRef } from 'react';
import { VisualizerMode } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { Activity, Disc3, BarChart2 } from 'lucide-react';

interface VisualizerProps {
  mode: VisualizerMode;
  onModeChange: (mode: VisualizerMode) => void;
  isPlaying: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  mode,
  onModeChange,
  isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const rotationAngleRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frequencyData = new Uint8Array(128);
    const timeDomainData = new Uint8Array(128);

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep dark background with subtle vignette
      ctx.fillStyle = '#0a0d13';
      ctx.fillRect(0, 0, width, height);

      // Get audio data from engine
      audioEngine.getAudioData(frequencyData, timeDomainData);

      let totalEnergy = 0;
      for (let i = 0; i < 32; i++) {
        totalEnergy += frequencyData[i];
      }
      const avgBassEnergy = totalEnergy / 32 / 255; // 0.0 to 1.0

      if (isPlaying) {
        rotationAngleRef.current += 0.008 + avgBassEnergy * 0.02;
      }

      if (mode === 'chronometer') {
        renderChronometer(ctx, width, height, frequencyData, avgBassEnergy);
      } else if (mode === 'waveform') {
        renderWaveform(ctx, width, height, timeDomainData, avgBassEnergy);
      } else {
        renderBars(ctx, width, height, frequencyData);
      }

      ctx.restore();
    };

    const renderChronometer = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      freq: Uint8Array,
      energy: number
    ) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.32;
      const pulseRadius = baseRadius + energy * 16;

      // Draw subtle outer concentric time rings
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.18, 0, Math.PI * 2);
      ctx.stroke();

      // Circular audio rays radiating outwards
      const numRays = 64;
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2 + rotationAngleRef.current;
        const freqIndex = Math.floor((i / numRays) * (freq.length * 0.7));
        const val = isPlaying ? freq[freqIndex] / 255 : 0.05 + Math.sin(i * 0.3) * 0.03;
        const rayLen = val * (baseRadius * 0.55);

        const x1 = centerX + Math.cos(angle) * pulseRadius;
        const y1 = centerY + Math.sin(angle) * pulseRadius;
        const x2 = centerX + Math.cos(angle) * (pulseRadius + rayLen);
        const y2 = centerY + Math.sin(angle) * (pulseRadius + rayLen);

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
        gradient.addColorStop(1, 'rgba(180, 83, 9, 0.1)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Main inner dial
      ctx.fillStyle = '#0d111a';
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing dial border
      ctx.strokeStyle = isPlaying ? 'rgba(245, 158, 11, 0.7)' : 'rgba(217, 119, 6, 0.4)';
      ctx.lineWidth = isPlaying ? 2.5 : 1.5;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = isPlaying ? 12 : 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Roman numerals / Hour tick marks
      for (let i = 0; i < 12; i++) {
        const tickAngle = (i / 12) * Math.PI * 2;
        const innerR = pulseRadius - 10;
        const outerR = pulseRadius - 2;
        const tx1 = centerX + Math.cos(tickAngle) * innerR;
        const ty1 = centerY + Math.sin(tickAngle) * innerR;
        const tx2 = centerX + Math.cos(tickAngle) * outerR;
        const ty2 = centerY + Math.sin(tickAngle) * outerR;

        ctx.strokeStyle = i % 3 === 0 ? '#f59e0b' : 'rgba(203, 213, 225, 0.4)';
        ctx.lineWidth = i % 3 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
      }

      // Center Time-Core: 95 Saal Chrono Motif
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('95 YRS', centerX, centerY - 6);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(isPlaying ? 'TIME RESUMED' : 'CHRONOS WAITING', centerX, centerY + 10);

      // Rotating Clock Hand (Time flow)
      const handAngle = rotationAngleRef.current * 1.5;
      const handLength = pulseRadius * 0.72;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(handAngle) * handLength, centerY + Math.sin(handAngle) * handLength);
      ctx.stroke();

      // Center hub
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const renderWaveform = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      wave: Uint8Array,
      energy: number
    ) => {
      const centerY = height / 2;
      ctx.lineWidth = 2.5;

      // Draw horizontal center guideline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw glowing oscilloscope waveform
      ctx.strokeStyle = isPlaying ? '#f59e0b' : 'rgba(217, 119, 6, 0.4)';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.shadowBlur = isPlaying ? 10 : 2;

      ctx.beginPath();
      const sliceWidth = width / wave.length;
      let x = 0;

      for (let i = 0; i < wave.length; i++) {
        const v = wave[i] / 128.0; // 0.0 - 2.0, 1.0 is center
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const renderBars = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      freq: Uint8Array
    ) => {
      const count = 48;
      const barWidth = (width / count) * 0.75;
      const gap = (width / count) * 0.25;

      for (let i = 0; i < count; i++) {
        const freqIdx = Math.floor((i / count) * (freq.length * 0.8));
        const val = isPlaying ? freq[freqIdx] / 255 : 0.05 + Math.sin(i * 0.25) * 0.03;
        const barHeight = Math.max(4, val * (height * 0.75));
        const x = i * (barWidth + gap) + gap / 2;
        const y = height - barHeight - 8;

        const grad = ctx.createLinearGradient(0, y, 0, height);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.5, '#d97706');
        grad.addColorStop(1, 'rgba(120, 53, 15, 0.2)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [mode, isPlaying]);

  return (
    <div id="visualizer-container" className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0e121a] to-[#090b0f] border border-amber-900/30 shadow-2xl">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-56 sm:h-64 block"
        style={{ width: '100%' }}
      />

      {/* Visualizer Mode Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs">
        <button
          id="btn-mode-chrono"
          onClick={() => onModeChange('chronometer')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
            mode === 'chronometer'
              ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Circular Chronometer Dial"
        >
          <Disc3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chrono Dial</span>
        </button>

        <button
          id="btn-mode-wave"
          onClick={() => onModeChange('waveform')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
            mode === 'waveform'
              ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Oscilloscope Waveform"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Waveform</span>
        </button>

        <button
          id="btn-mode-bars"
          onClick={() => onModeChange('bars')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
            mode === 'bars'
              ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Frequency Spectrum"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Spectrum</span>
        </button>
      </div>

      {/* Atmospheric bottom status bar */}
      <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs text-amber-400/80 font-mono pointer-events-none">
        <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}`} />
        <span>{isPlaying ? 'AUDIO ENGINE ACTIVE // 24kHz PCM' : 'CHRONOS STANDBY // READY'}</span>
      </div>
    </div>
  );
};
