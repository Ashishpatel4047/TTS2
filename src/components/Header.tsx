import React from 'react';
import { Volume2, Sparkles, Clock, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header id="app-header" className="w-full border-b border-amber-900/30 bg-[#0d1017]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-cinzel tracking-wider">
                TEXT TO SPEECH STUDIO
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3 h-3" /> Reference Voice
              </span>
            </div>
            <p className="text-xs text-slate-400">
              "Maine 95 saal tak duniya ke waqt ko roka..." Voice Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Model:</span>
            <code className="text-amber-400 font-mono font-semibold">gemini-3.1-flash-tts-preview</code>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-slate-300">24 kHz Studio</span>
          </div>
        </div>
      </div>
    </header>
  );
};
