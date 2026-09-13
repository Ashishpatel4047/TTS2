import React from 'react';
import { Play, Pause, Download, Trash2, Clock, Volume2 } from 'lucide-react';
import { AudioClip } from '../types';

interface HistoryListProps {
  clips: AudioClip[];
  currentClipId: string | null;
  isPlaying: boolean;
  onPlayClip: (clip: AudioClip) => void;
  onPauseClip: () => void;
  onDeleteClip: (id: string) => void;
  onDownloadClip: (clip: AudioClip, format?: 'mp3' | 'wav') => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  clips,
  currentClipId,
  isPlaying,
  onPlayClip,
  onPauseClip,
  onDeleteClip,
  onDownloadClip,
}) => {
  if (clips.length === 0) {
    return null;
  }

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div id="history-section" className="w-full rounded-2xl bg-[#0f121a] border border-slate-800/80 p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200 font-cinzel">
            GENERATION VAULT & RECORDINGS ({clips.length})
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Stored locally in session
        </span>
      </div>

      <div className="space-y-2.5">
        {clips.map((clip) => {
          const isThisActive = currentClipId === clip.id;
          const isThisPlaying = isThisActive && isPlaying;

          return (
            <div
              key={clip.id}
              id={`clip-row-${clip.id}`}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isThisActive
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                  : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800'
              }`}
            >
              {/* Info */}
              <div className="flex items-start gap-3 min-w-0">
                <button
                  id={`btn-play-clip-${clip.id}`}
                  onClick={() => (isThisPlaying ? onPauseClip() : onPlayClip(clip))}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                    isThisPlaying
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300'
                  }`}
                  title={isThisPlaying ? 'Pause' : 'Play'}
                >
                  {isThisPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 truncate font-cinzel">
                      {clip.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
                      {clip.voice}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {clip.format || 'MP3'}
                    </span>
                    {clip.duration > 0 && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {clip.duration.toFixed(1)}s
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-serif italic">
                    "{clip.text}"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1.5 shrink-0">
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline mr-1">
                  {formatTimestamp(clip.createdAt)}
                </span>

                {/* MP3 Download */}
                <button
                  id={`btn-download-clip-mp3-${clip.id}`}
                  onClick={() => onDownloadClip(clip, 'mp3')}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1"
                  title="Download in MP3 format (192kbps)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>MP3</span>
                </button>

                {/* WAV Download */}
                <button
                  id={`btn-download-clip-wav-${clip.id}`}
                  onClick={() => onDownloadClip(clip, 'wav')}
                  className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1"
                  title="Download in Lossless WAV format"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>WAV</span>
                </button>

                {!clip.isReference && (
                  <button
                    id={`btn-delete-clip-${clip.id}`}
                    onClick={() => onDeleteClip(clip.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Delete Take"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
