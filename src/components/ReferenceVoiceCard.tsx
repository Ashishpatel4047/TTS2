import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Copy, Check, Sparkles, SlidersHorizontal, Download } from 'lucide-react';
import { REFERENCE_QUOTE } from '../data/presets';

interface ReferenceVoiceCardProps {
  isPlaying: boolean;
  isReferenceActive: boolean;
  currentTime: number;
  duration: number;
  onPlayReference: () => void;
  onPauseReference: () => void;
  onLoadIntoStudio: (text: string, voice: string, style: string) => void;
}

export const ReferenceVoiceCard: React.FC<ReferenceVoiceCardProps> = ({
  isPlaying,
  isReferenceActive,
  currentTime,
  duration,
  onPlayReference,
  onPauseReference,
  onLoadIntoStudio,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERENCE_QUOTE.roman);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine which phrase is active during playback
  const isPhraseActive = (start: number, end: number) => {
    if (!isReferenceActive || !isPlaying) return false;
    return currentTime >= start && currentTime < end;
  };

  return (
    <div id="reference-voice-card" className="w-full rounded-2xl bg-gradient-to-br from-[#121620] via-[#0f121a] to-[#0a0d13] border border-amber-500/30 p-5 sm:p-7 shadow-xl relative overflow-hidden">
      {/* Subtle backdrop watermark */}
      <div className="absolute -right-8 -bottom-10 text-9xl font-cinzel font-bold text-amber-500/5 select-none pointer-events-none">
        95
      </div>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-amber-900/20 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-amber-200 tracking-wider font-cinzel">
                ORIGINAL REFERENCE VOICE
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25">
                Cinematic Chronos
              </span>
            </div>
            <p className="text-xs text-slate-400">
              The benchmark audio delivered in a deep, ancient, raspy tone
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-download-ref-mp3"
            onClick={() => {
              const a = document.createElement('a');
              a.href = '/reference_voice.mp3';
              a.download = 'maine_95_saal_reference_voice.mp3';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 border border-amber-500/40 transition-colors font-medium"
            title="Download Reference Audio in MP3 Format (192kbps)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>MP3</span>
          </button>

          <button
            id="btn-copy-quote"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
            title="Copy Quote"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy Quote'}</span>
          </button>

          <button
            id="btn-load-quote-to-studio"
            onClick={() => onLoadIntoStudio(REFERENCE_QUOTE.roman, 'Charon', 'Speak in a deep, ancient, raspy, dramatic cinematic voice with slow, heavy pauses')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
            title="Load into TTS Studio to recreate or tweak"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Load in Studio</span>
          </button>
        </div>
      </div>

      {/* Main Quote Display */}
      <div className="space-y-4 my-2">
        {/* Roman Hindi Quote with karaoke phrase highlighting */}
        <div className="p-4 rounded-xl bg-black/40 border border-amber-900/20">
          <p className="text-lg sm:text-xl md:text-2xl font-cinzel text-slate-100 font-semibold leading-relaxed tracking-wide">
            {REFERENCE_QUOTE.timestamps.map((phrase, idx) => {
              const active = isPhraseActive(phrase.start, phrase.end);
              return (
                <span
                  key={idx}
                  className={`inline-block transition-all duration-200 mr-1.5 ${
                    active
                      ? 'text-amber-400 scale-105 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] font-bold'
                      : 'text-slate-200'
                  }`}
                >
                  "{idx === 0 ? '' : ''}{phrase.text}{idx === REFERENCE_QUOTE.timestamps.length - 1 ? '"' : ''}
                </span>
              );
            })}
          </p>
        </div>

        {/* Devanagari Hindi translation */}
        <div className="flex items-baseline gap-3 text-sm sm:text-base text-amber-200/90 font-devanagari tracking-wide px-1">
          <span className="text-xs uppercase font-sans text-slate-400">हिन्दी:</span>
          <span>{REFERENCE_QUOTE.hindi}</span>
        </div>

        {/* English meaning */}
        <div className="text-xs sm:text-sm text-slate-400 italic px-1">
          "{REFERENCE_QUOTE.english}"
        </div>
      </div>

      {/* Acoustic Profile Badges */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-amber-900/20 text-xs">
        <span className="text-slate-400 font-medium mr-1">Voice Profile:</span>
        <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
          Voice: <strong className="text-amber-300">Charon</strong>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
          Archetype: <strong className="text-slate-200">Ancient Timekeeper</strong>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
          Timbre: <strong className="text-slate-200">Gravelly Raspy Baritone</strong>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
          Pacing: <strong className="text-slate-200">Heavy Dramatic Pauses</strong>
        </span>
      </div>

      {/* Playback action bar */}
      <div className="mt-5 flex items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            id="btn-play-reference"
            onClick={() => {
              if (isReferenceActive && isPlaying) {
                onPauseReference();
              } else {
                onPlayReference();
              }
            }}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
            title={isReferenceActive && isPlaying ? 'Pause Reference' : 'Play Reference Voice'}
          >
            {isReferenceActive && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <div>
            <div className="text-xs font-semibold text-slate-200">
              {isReferenceActive && isPlaying ? 'Playing Reference Voice' : 'Listen to Reference Audio'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {isReferenceActive
                ? `${Math.floor(currentTime)}s / ${Math.floor(duration || 16)}s`
                : 'Duration: ~16s • High Fidelity 24kHz'}
            </div>
          </div>
        </div>

        {/* Progress indicator mini-bar */}
        <div className="hidden sm:block flex-1 max-w-xs mx-4">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-100"
              style={{
                width: isReferenceActive && duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
              }}
            />
          </div>
        </div>

        <button
          id="btn-restart-reference"
          onClick={onPlayReference}
          className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          title="Replay from start"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
