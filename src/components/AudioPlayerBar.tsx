import React from 'react';
import { Play, Pause, Download, Volume2, VolumeX, Repeat, RotateCcw, SplitSquareVertical } from 'lucide-react';
import { AudioClip } from '../types';

interface AudioPlayerBarProps {
  currentClip: AudioClip | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLooping: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleLoop: () => void;
  onDownload?: () => void;
  onDownloadMp3?: () => void;
  onDownloadWav?: () => void;
  onCompareWithReference?: () => void;
  isComparing?: boolean;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentClip,
  isPlaying,
  currentTime,
  duration,
  volume,
  isLooping,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onToggleLoop,
  onDownload,
  onDownloadMp3,
  onDownloadWav,
  onCompareWithReference,
  isComparing = false,
}) => {
  if (!currentClip) return null;

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  return (
    <div
      id="audio-player-bar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1017]/95 backdrop-blur-xl border-t border-amber-900/40 px-4 sm:px-6 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 w-full sm:w-1/4 min-w-[200px]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-cinzel font-bold text-xs shrink-0">
            {currentClip.format?.toUpperCase() || (currentClip.isReference ? 'REF' : 'MP3')}
          </div>

          <div className="truncate">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-bold text-slate-100 truncate font-cinzel">
                {currentClip.title}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                {currentClip.format?.toUpperCase() || 'MP3'}
              </span>
            </div>
            <div className="text-[11px] text-amber-300/80 truncate font-mono">
              Voice: {currentClip.voice} {currentClip.isReference ? '(Reference)' : '(Gemini 3.1)'}
            </div>
          </div>
        </div>

        {/* Center: Controls & Timeline */}
        <div className="flex flex-col items-center gap-1.5 w-full sm:w-2/4">
          <div className="flex items-center gap-4">
            <button
              id="btn-player-repeat"
              onClick={onToggleLoop}
              className={`p-1.5 rounded-lg transition-colors text-xs ${
                isLooping ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isLooping ? 'Loop Enabled' : 'Loop Disabled'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            <button
              id="btn-player-rewind"
              onClick={() => onSeek(0)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="btn-player-play-toggle"
              onClick={isPlaying ? onPause : onPlay}
              className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {onCompareWithReference && (
              <button
                id="btn-player-compare"
                onClick={onCompareWithReference}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                  isComparing
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Switch between your TTS generation and original reference"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Compare Ref</span>
              </button>
            )}
          </div>

          {/* Timeline slider */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
              {formatTime(currentTime)}
            </span>

            <input
              id="player-timeline-slider"
              type="range"
              min="0"
              max={duration > 0 ? duration : 100}
              step="0.05"
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />

            <span className="text-[11px] font-mono text-slate-400 w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume & Download */}
        <div className="flex items-center justify-end gap-2 w-full sm:w-1/4">
          <div className="hidden lg:flex items-center gap-2 mr-1">
            <button
              id="btn-player-mute"
              onClick={() => onVolumeChange(volume > 0 ? 0 : 1)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              id="player-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>

          {/* Primary MP3 Download */}
          <button
            id="btn-player-download-mp3"
            onClick={onDownloadMp3 || onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-cinzel transition-all shadow-md shadow-amber-500/20 active:scale-95"
            title="Download Audio in MP3 Format (192kbps)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>MP3</span>
          </button>

          {/* Secondary WAV Download */}
          <button
            id="btn-player-download-wav"
            onClick={onDownloadWav || onDownload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 text-xs font-medium transition-colors"
            title="Download Lossless Studio Master (WAV)"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">WAV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
