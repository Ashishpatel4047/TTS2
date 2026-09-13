import React from 'react';
import { Sliders, RotateCcw, Zap, Volume2, Waves } from 'lucide-react';
import { AudioEffectSettings } from '../types';

interface AudioFXControlsProps {
  effects: AudioEffectSettings;
  onChange: (effects: AudioEffectSettings) => void;
  onReset: () => void;
}

export const AudioFXControls: React.FC<AudioFXControlsProps> = ({
  effects,
  onChange,
  onReset,
}) => {
  return (
    <div id="audio-fx-controls" className="w-full rounded-2xl bg-[#0f121a] border border-slate-800/80 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200 font-cinzel">
            ACOUSTIC & TEMPORAL FX
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            Live Web Audio DSP
          </span>
        </div>

        <button
          id="btn-reset-fx"
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          title="Reset to neutral acoustic settings"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset FX</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Playback Speed / Time-Dilation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Time Dilation (Speed)
            </span>
            <span className="font-mono text-amber-300 font-semibold">
              {effects.playbackRate.toFixed(2)}x
            </span>
          </div>

          <input
            id="slider-speed"
            type="range"
            min="0.7"
            max="1.3"
            step="0.05"
            value={effects.playbackRate}
            onChange={(e) => onChange({ ...effects, playbackRate: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0.70x (Deep Slow)</span>
            <span>1.0x (Original)</span>
            <span>1.30x (Swift)</span>
          </div>
        </div>

        {/* Sub-Bass Rumble */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              Sub-Bass Rumble (110Hz)
            </span>
            <span className="font-mono text-amber-300 font-semibold">
              +{effects.bassBoost.toFixed(0)} dB
            </span>
          </div>

          <input
            id="slider-bass"
            type="range"
            min="0"
            max="14"
            step="1"
            value={effects.bassBoost}
            onChange={(e) => onChange({ ...effects, bassBoost: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Flat (0dB)</span>
            <span>+6dB (Warm)</span>
            <span>+14dB (Cinema Chest)</span>
          </div>
        </div>

        {/* Temporal Void Echo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-amber-400" />
              Temporal Echo (Void Delay)
            </span>
            <span className="font-mono text-amber-300 font-semibold">
              {Math.round(effects.echoMix * 100)}%
            </span>
          </div>

          <input
            id="slider-echo"
            type="range"
            min="0"
            max="0.6"
            step="0.05"
            value={effects.echoMix}
            onChange={(e) => onChange({ ...effects, echoMix: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Dry (0%)</span>
            <span>Subtle (20%)</span>
            <span>Spacious Void (60%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
