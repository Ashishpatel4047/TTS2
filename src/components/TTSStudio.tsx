import React, { useState, useEffect } from 'react';
import { Sparkles, Mic, Wand2, RefreshCw, AlertCircle, Check, FileAudio, Music, Clock, Play } from 'lucide-react';
import { VOICE_OPTIONS, STYLE_DIRECTING_PRESETS, DIALOGUE_PRESETS } from '../data/presets';
import { DialoguePreset, AudioFormat } from '../types';

interface TTSStudioProps {
  inputText: string;
  onInputChange: (text: string) => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  stylePrompt: string;
  onStylePromptChange: (prompt: string) => void;
  audioFormat: AudioFormat;
  onAudioFormatChange: (format: AudioFormat) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  errorMessage: string | null;
  onSelectPreset: (preset: DialoguePreset) => void;
}

export const TTSStudio: React.FC<TTSStudioProps> = ({
  inputText,
  onInputChange,
  selectedVoice,
  onVoiceChange,
  stylePrompt,
  onStylePromptChange,
  audioFormat,
  onAudioFormatChange,
  isGenerating,
  onGenerate,
  errorMessage,
  onSelectPreset,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('waqt-95-saal');
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

  // Parse error message and extract rate limit / retry info
  const parsedError = React.useMemo(() => {
    if (!errorMessage) return null;
    let isRateLimit = false;
    let cleanMessage = errorMessage;
    let waitSec: number | null = null;

    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed.error) {
        if (
          parsed.error.code === 429 ||
          parsed.error.status === 'RESOURCE_EXHAUSTED' ||
          (parsed.error.message && parsed.error.message.includes('quota'))
        ) {
          isRateLimit = true;
          const retryObj = parsed.error.details?.find((d: any) => d.retryDelay);
          if (retryObj?.retryDelay) {
            waitSec = parseInt(String(retryObj.retryDelay).replace('s', ''), 10);
          }
          cleanMessage = 'Gemini Free Tier API rate limit reached (10 requests/min).';
        } else if (parsed.error.message) {
          cleanMessage = parsed.error.message;
        }
      }
    } catch {
      if (
        errorMessage.includes('429') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('Rate Limit')
      ) {
        isRateLimit = true;
        const match = errorMessage.match(/retry in\s+([\d\.]+)s/i) || errorMessage.match(/wait\s+([\d\.]+)\s+seconds/i);
        if (match && match[1]) {
          waitSec = Math.ceil(parseFloat(match[1]));
        }
        cleanMessage = 'Gemini Free Tier API rate limit reached (10 requests/min).';
      }
    }

    return { isRateLimit, cleanMessage, waitSec };
  }, [errorMessage]);

  useEffect(() => {
    if (parsedError?.isRateLimit) {
      setCooldownRemaining(parsedError.waitSec || 45);
    } else {
      setCooldownRemaining(null);
    }
  }, [parsedError]);

  useEffect(() => {
    if (cooldownRemaining === null || cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const handlePresetClick = (preset: DialoguePreset) => {
    setSelectedPresetId(preset.id);
    onSelectPreset(preset);
  };

  return (
    <div id="tts-studio-workspace" className="w-full rounded-2xl bg-[#0f121a] border border-amber-900/30 p-5 sm:p-7 shadow-xl space-y-6">
      {/* Header & Preset Selector */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-slate-100 font-cinzel">
              SPEECH SYNTHESIZER
            </h2>
            <span className="text-xs text-slate-400">
              Powered by <code className="text-amber-400 font-mono">gemini-3.1-flash-tts-preview</code>
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Char count: <span className="font-mono text-amber-300">{inputText.length}</span>
          </div>
        </div>

        {/* Quick Dialogue Presets */}
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-2">
            Quick Dialogues & Reference Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {DIALOGUE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100 border border-slate-700/60'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                  <span>{preset.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-1.5">
        <label htmlFor="tts-input-text" className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span>Dialogue / Script Text (Hindi, Urdu, or English)</span>
          <span className="text-[11px] text-slate-500">Supports Devanagari and Roman script</span>
        </label>

        <div className="relative">
          <textarea
            id="tts-input-text"
            rows={3}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type or paste dialogue here... e.g. Maine 95 saal tak duniya ke waqt ko roka..."
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/40 text-slate-100 text-sm placeholder-slate-500 outline-none resize-none transition-all font-serif"
          />
        </div>
      </div>

      {/* Voice Selection Cards */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300 block">
          Select Gemini TTS Voice Character:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {VOICE_OPTIONS.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <button
                key={v.id}
                id={`voice-card-${v.id}`}
                type="button"
                onClick={() => onVoiceChange(v.id)}
                className={`p-3 rounded-xl text-left transition-all relative flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-900/30 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {v.badge && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                    {v.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-100 font-cinzel">
                      {v.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
                      {v.pitch}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-300/90 font-medium mb-1.5">
                    {v.archetype}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {v.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone & Style Directing Prompt */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Voice Tone & Cinematic Direction (Style Guidance)</span>
          </label>
          <span className="text-[10px] text-slate-500">Guides cadence, raspy texture, and emotion</span>
        </div>

        {/* Style presets */}
        <div className="flex flex-wrap gap-2">
          {STYLE_DIRECTING_PRESETS.map((p) => {
            const isActive = stylePrompt === p.prompt;
            return (
              <button
                key={p.id}
                id={`style-${p.id}`}
                type="button"
                onClick={() => onStylePromptChange(p.prompt)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40 font-medium'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Style prompt text */}
        <input
          id="tts-style-prompt"
          type="text"
          value={stylePrompt}
          onChange={(e) => onStylePromptChange(e.target.value)}
          placeholder="Direct the delivery, e.g. Speak in a deep, ancient, raspy, dramatic voice..."
          className="w-full px-3 py-2 rounded-xl bg-black/30 border border-slate-800 text-xs text-slate-200 focus:border-amber-500/40 outline-none font-mono"
        />
      </div>

      {/* Audio Output Format Selector (MP3 vs WAV) */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>Output Audio Format:</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            Direct MP3 encoding enabled via FFmpeg
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* MP3 Option */}
          <button
            id="format-select-mp3"
            type="button"
            onClick={() => onAudioFormatChange('mp3')}
            className={`p-3 rounded-xl text-left transition-all border flex items-center justify-between ${
              audioFormat === 'mp3'
                ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs font-cinzel ${
                  audioFormat === 'mp3'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                MP3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 font-cinzel">
                    MP3 Audio
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  192 kbps • Universal Compatibility • Compact Size
                </p>
              </div>
            </div>
            {audioFormat === 'mp3' && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
          </button>

          {/* WAV Option */}
          <button
            id="format-select-wav"
            type="button"
            onClick={() => onAudioFormatChange('wav')}
            className={`p-3 rounded-xl text-left transition-all border flex items-center justify-between ${
              audioFormat === 'wav'
                ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs font-cinzel ${
                  audioFormat === 'wav'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                WAV
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 font-cinzel">
                    WAV Studio Master
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                    Lossless
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  24,000 Hz • 16-bit Linear PCM • Uncompressed
                </p>
              </div>
            </div>
            {audioFormat === 'wav' && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Error Message / Rate Limit Banner */}
      {errorMessage && (
        <div
          id="tts-error-banner"
          className={`p-4 rounded-xl border text-xs transition-all ${
            parsedError?.isRateLimit
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-red-950/40 border-red-800/50 text-red-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {parsedError?.isRateLimit ? (
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm tracking-wide font-cinzel text-amber-300">
                  {parsedError?.isRateLimit ? 'API Rate Limit (Cooldown Active)' : 'Synthesis Notice'}
                </span>
                {cooldownRemaining !== null && cooldownRemaining > 0 && (
                  <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Ready in {cooldownRemaining}s
                  </span>
                )}
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                {parsedError?.isRateLimit
                  ? `Google Gemini Free Tier allows 10 TTS requests per minute. The cooldown will reset automatically in ${
                      cooldownRemaining ? `${cooldownRemaining}s` : 'a few seconds'
                    }.`
                  : parsedError?.cleanMessage || errorMessage}
              </p>

              {parsedError?.isRateLimit && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    💡 <strong>Pro-Tip:</strong> The iconic <strong>Arlo L monologues</strong> &amp; reference voice are already pre-rendered below!
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const libraryEl = document.getElementById('clips-history-section');
                      libraryEl?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" />
                    <span>Listen in Library</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Ready to generate <strong className="text-amber-300 uppercase font-mono">{audioFormat}</strong> with{' '}
            <strong className="text-amber-300">{selectedVoice}</strong>
          </span>
        </div>

        <button
          id="btn-generate-tts"
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !inputText.trim()}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold font-cinzel text-sm tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg ${
            isGenerating || !inputText.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-slate-950 shadow-amber-500/20 active:scale-98'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>SYNTHESIZING {audioFormat.toUpperCase()}...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>GENERATE SPEECH ({audioFormat.toUpperCase()})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
