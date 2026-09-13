export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  pitch: string;
  gender: string;
  archetype: string;
  badge?: string;
}

export interface DialoguePreset {
  id: string;
  title: string;
  category: string;
  hindi: string;
  roman: string;
  englishTranslation: string;
  suggestedVoice: string;
  suggestedStyle: string;
  audioUrl?: string;
  mp3Url?: string;
  wavUrl?: string;
  duration?: number;
}

export type AudioFormat = 'mp3' | 'wav';

export interface AudioClip {
  id: string;
  title: string;
  text: string;
  hindi?: string;
  roman?: string;
  voice: string;
  stylePrompt: string;
  audioUrl: string;
  mp3Url?: string;
  wavUrl?: string;
  format?: AudioFormat;
  bitrate?: string;
  duration: number;
  createdAt: number;
  isReference?: boolean;
}

export interface AudioEffectSettings {
  playbackRate: number; // 0.75 - 1.25
  bassBoost: number;    // 0 - 12 dB
  reverbMix: number;    // 0 - 0.8
  echoMix: number;      // 0 - 0.8
}

export type VisualizerMode = 'chronometer' | 'waveform' | 'bars';
