import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ReferenceVoiceCard } from './components/ReferenceVoiceCard';
import { Visualizer } from './components/Visualizer';
import { TTSStudio } from './components/TTSStudio';
import { AudioFXControls } from './components/AudioFXControls';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { HistoryList } from './components/HistoryList';
import { audioEngine } from './utils/audioEngine';
import { AudioClip, AudioEffectSettings, DialoguePreset, VisualizerMode, AudioFormat } from './types';
import { REFERENCE_QUOTE, DIALOGUE_PRESETS } from './data/presets';

export default function App() {
  // TTS Form States
  const [inputText, setInputText] = useState<string>(
    'Tees saal lage unhe mera naam jaan ne mein... aur agle saath saal lage mujhe dhoondhne mein. Lekin jab tak unke hathiyar meri dehleez chhuenge, meri rooh unka sara system jala chuki hogi.'
  );
  const [selectedVoice, setSelectedVoice] = useState<string>('Charon');
  const [stylePrompt, setStylePrompt] = useState<string>(
    'Speak in an ancient, 95-year-old raspy dying whisper, slow cinematic breaths, and unflinching cold majesty'
  );
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('mp3');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Engine & Playback States
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('chronometer');
  const [effects, setEffects] = useState<AudioEffectSettings>({
    playbackRate: 1.0,
    bassBoost: 5,
    reverbMix: 0.2,
    echoMix: 0.2,
  });

  const referenceClip: AudioClip = {
    id: 'ref-95-saal',
    title: 'Reference Voice: 95 Saal Ka Waqt',
    text: REFERENCE_QUOTE.roman,
    hindi: REFERENCE_QUOTE.hindi,
    voice: 'Charon',
    stylePrompt: 'Ancient & Raspy Benchmark',
    audioUrl: '/reference_voice.mp3',
    mp3Url: '/reference_voice.mp3',
    wavUrl: '/reference_voice.wav',
    format: 'mp3',
    bitrate: '192 kbps',
    duration: 16.5,
    createdAt: Date.now() - 120000,
    isReference: true,
  };

  const initialClips: AudioClip[] = [
    referenceClip,
    {
      id: 'clip-arlo-tees-saal',
      title: 'Arlo L: Tees Saal Lage (Passing the Torch)',
      text: 'Tees saal lage unhe mera naam jaan ne mein... aur agle saath saal lage mujhe dhoondhne mein. Lekin jab tak unke hathiyar meri dehleez chhuenge, meri rooh unka sara system jala chuki hogi.',
      hindi: 'तीस साल लगे उन्हें मेरा नाम जानने में... और अगले साठ साल लगे मुझे ढूंढने में। लेकिन जब तक उनके हथियार मेरी देहलीज़ छुएंगे, मेरी रूह उनका सारा सिस्टम जला चुकी होगी।',
      voice: 'Charon',
      stylePrompt: 'Speak in an ancient, 95-year-old raspy dying whisper, slow cinematic breaths, and unflinching cold majesty',
      audioUrl: '/arlo_tees_saal.mp3',
      mp3Url: '/arlo_tees_saal.mp3',
      wavUrl: '/arlo_tees_saal.wav',
      format: 'mp3',
      bitrate: '192 kbps',
      duration: 18.14,
      createdAt: Date.now() - 60000,
    },
    {
      id: 'clip-arlo-ghadi-ki-sui',
      title: 'Arlo L: Ghadi Ki Sui (Dominion Over Time)',
      text: 'Duniya samajhti hai waqt ghadi ki sui se chalta hai... unhe nahi pata, ghadi ki sui maine rok rakhi thi.',
      hindi: 'दुनिया समझती है वक्त घड़ी की सुई से चलता है... उन्हें नहीं पता, घड़ी की सुई मैंने रोक रखी थी।',
      voice: 'Charon',
      stylePrompt: 'Deliver with weary, gravelly baritone resonance, ancient authority, dramatic lingering pauses',
      audioUrl: '/arlo_ghadi_ki_sui.mp3',
      mp3Url: '/arlo_ghadi_ki_sui.mp3',
      wavUrl: '/arlo_ghadi_ki_sui.wav',
      format: 'mp3',
      bitrate: '192 kbps',
      duration: 15.24,
      createdAt: Date.now() - 30000,
    },
  ];

  const [clips, setClips] = useState<AudioClip[]>(initialClips);
  const [currentClip, setCurrentClip] = useState<AudioClip | null>(initialClips[1]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(16.5);
  const [volume, setVolume] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);

  // Reference to last generated clip for quick comparison
  const lastGeneratedClipRef = useRef<AudioClip | null>(null);

  // Initialize engine event listeners
  useEffect(() => {
    audioEngine.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      if (dur > 0 && Number.isFinite(dur)) {
        setDuration(dur);
      }
    });

    audioEngine.onEnded(() => {
      setIsPlaying(false);
    });

    // Load initial reference audio into engine so it is instantly ready
    audioEngine.loadAudio(referenceClip.audioUrl, effects);
  }, []);

  const handlePlayClip = async (clip: AudioClip) => {
    setCurrentClip(clip);
    audioEngine.loadAudio(clip.audioUrl, effects);
    await audioEngine.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    audioEngine.pause();
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    audioEngine.seek(time);
    setCurrentTime(time);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    audioEngine.setLoop(next);
  };

  const handleEffectsChange = (newEffects: AudioEffectSettings) => {
    setEffects(newEffects);
    audioEngine.applyEffects(newEffects);
  };

  const handleResetEffects = () => {
    const defaultEffects: AudioEffectSettings = {
      playbackRate: 1.0,
      bassBoost: 0,
      reverbMix: 0,
      echoMix: 0,
    };
    setEffects(defaultEffects);
    audioEngine.applyEffects(defaultEffects);
  };

  const handleLoadIntoStudio = (text: string, voice: string, style: string) => {
    setInputText(text);
    setSelectedVoice(voice);
    setStylePrompt(style);
    // Smooth scroll to studio
    const studioEl = document.getElementById('tts-studio-workspace');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPreset = (preset: DialoguePreset) => {
    setInputText(preset.roman);
    setSelectedVoice(preset.suggestedVoice);
    setStylePrompt(preset.suggestedStyle);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText.trim(),
          voiceName: selectedVoice,
          stylePrompt: stylePrompt.trim(),
          format: audioFormat,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize audio.');
      }

      // Convert MP3 base64 to Blob URL
      let mp3Url: string | undefined;
      const mp3SourceBase64 = data.mp3Base64 || (data.format === 'mp3' ? data.audioBase64 : null);
      if (mp3SourceBase64) {
        const mp3Chars = atob(mp3SourceBase64);
        const mp3Bytes = new Uint8Array(mp3Chars.length);
        for (let i = 0; i < mp3Chars.length; i++) {
          mp3Bytes[i] = mp3Chars.charCodeAt(i);
        }
        const mp3Blob = new Blob([mp3Bytes], { type: 'audio/mp3' });
        mp3Url = URL.createObjectURL(mp3Blob);
      }

      // Convert WAV base64 to Blob URL
      let wavUrl: string | undefined;
      const wavSourceBase64 = data.wavBase64 || (data.format === 'wav' ? data.audioBase64 : null);
      if (wavSourceBase64) {
        const wavChars = atob(wavSourceBase64);
        const wavBytes = new Uint8Array(wavChars.length);
        for (let i = 0; i < wavChars.length; i++) {
          wavBytes[i] = wavChars.charCodeAt(i);
        }
        const wavBlob = new Blob([wavBytes], { type: 'audio/wav' });
        wavUrl = URL.createObjectURL(wavBlob);
      }

      // Determine the active primary audio URL based on user choice
      const chosenFormat: AudioFormat = data.format || audioFormat;
      const primaryUrl = chosenFormat === 'mp3' ? (mp3Url || wavUrl!) : (wavUrl || mp3Url!);

      const newClip: AudioClip = {
        id: `take-${Date.now()}`,
        title: inputText.length > 35 ? inputText.substring(0, 35) + '...' : inputText,
        text: inputText,
        voice: data.voice,
        stylePrompt: stylePrompt,
        audioUrl: primaryUrl,
        mp3Url: mp3Url,
        wavUrl: wavUrl,
        format: chosenFormat,
        bitrate: data.bitrate || (chosenFormat === 'mp3' ? '192 kbps' : '768 kbps'),
        duration: data.duration || 0,
        createdAt: Date.now(),
      };

      lastGeneratedClipRef.current = newClip;
      setClips((prev) => [newClip, ...prev]);

      // Automatically play newly generated take
      await handlePlayClip(newClip);
    } catch (err: any) {
      console.error('TTS Generation error:', err);
      setErrorMessage(err.message || 'Error occurred while generating speech with Gemini TTS.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadClip = (clip: AudioClip, targetFormat?: 'mp3' | 'wav') => {
    const fmt = targetFormat || clip.format || 'mp3';
    const targetUrl = fmt === 'mp3' ? (clip.mp3Url || clip.audioUrl) : (clip.wavUrl || clip.audioUrl);
    const safeTitle = clip.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'take';
    const filename = `${safeTitle}.${fmt}`;

    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = (format?: 'mp3' | 'wav') => {
    if (currentClip) {
      handleDownloadClip(currentClip, format);
    }
  };

  const handleCompareWithReference = () => {
    if (currentClip?.isReference) {
      // If currently playing reference, switch to last generated take
      if (lastGeneratedClipRef.current) {
        handlePlayClip(lastGeneratedClipRef.current);
      }
    } else {
      // Switch to reference
      handlePlayClip(referenceClip);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d13] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-32">
        {/* Top Section: Visualizer & Live Chronometer */}
        <section id="section-visualizer" className="space-y-2">
          <Visualizer
            mode={visualizerMode}
            onModeChange={setVisualizerMode}
            isPlaying={isPlaying}
          />
        </section>

        {/* Reference Voice Hero Card */}
        <section id="section-reference-voice">
          <ReferenceVoiceCard
            isPlaying={isPlaying}
            isReferenceActive={currentClip?.isReference === true}
            currentTime={currentTime}
            duration={duration}
            onPlayReference={() => handlePlayClip(referenceClip)}
            onPauseReference={handlePause}
            onLoadIntoStudio={handleLoadIntoStudio}
          />
        </section>

        {/* Speech Synthesizer Studio (gemini-3.1-flash-tts-preview) */}
        <section id="section-tts-studio">
          <TTSStudio
            inputText={inputText}
            onInputChange={setInputText}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            stylePrompt={stylePrompt}
            onStylePromptChange={setStylePrompt}
            audioFormat={audioFormat}
            onAudioFormatChange={setAudioFormat}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            errorMessage={errorMessage}
            onSelectPreset={handleSelectPreset}
          />
        </section>

        {/* Acoustic & Temporal FX Controls */}
        <section id="section-audio-fx">
          <AudioFXControls
            effects={effects}
            onChange={handleEffectsChange}
            onReset={handleResetEffects}
          />
        </section>

        {/* Generation Vault / History List */}
        <section id="section-history">
          <HistoryList
            clips={clips}
            currentClipId={currentClip?.id || null}
            isPlaying={isPlaying}
            onPlayClip={handlePlayClip}
            onPauseClip={handlePause}
            onDeleteClip={(id) => {
              setClips((prev) => prev.filter((c) => c.id !== id));
              if (currentClip?.id === id) {
                handlePlayClip(referenceClip);
              }
            }}
            onDownloadClip={handleDownloadClip}
          />
        </section>
      </main>

      {/* Persistent Bottom Player Bar */}
      <AudioPlayerBar
        currentClip={currentClip}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isLooping={isLooping}
        onPlay={() => {
          if (currentClip) {
            audioEngine.play();
            setIsPlaying(true);
          }
        }}
        onPause={handlePause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleLoop={handleToggleLoop}
        onDownload={() => handleDownload(audioFormat)}
        onDownloadMp3={() => handleDownload('mp3')}
        onDownloadWav={() => handleDownload('wav')}
        onCompareWithReference={clips.length > 1 ? handleCompareWithReference : undefined}
        isComparing={currentClip?.isReference === true}
      />
    </div>
  );
}
