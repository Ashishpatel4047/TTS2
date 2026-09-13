import { AudioEffectSettings } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;
  private delayMixGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;

  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private isConnected = false;

  private currentUrl = '';

  constructor() {
    // AudioContext will be initialized upon user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public loadAudio(url: string, effects?: AudioEffectSettings) {
    this.initContext();

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    } else {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';

      this.audioElement.addEventListener('timeupdate', () => {
        if (this.audioElement && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.audioElement.currentTime, this.audioElement.duration || 0);
        }
      });

      this.audioElement.addEventListener('ended', () => {
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      });
    }

    this.currentUrl = url;
    this.audioElement.src = url;
    this.audioElement.load();

    this.setupNodes();
    if (effects) {
      this.applyEffects(effects);
    }
  }

  private setupNodes() {
    if (!this.ctx || !this.audioElement) return;

    if (!this.isConnected) {
      try {
        this.mediaSourceNode = this.ctx.createMediaElementSource(this.audioElement);

        // Sub-bass filter (Low shelf around 100Hz)
        this.bassFilter = this.ctx.createBiquadFilter();
        this.bassFilter.type = 'lowshelf';
        this.bassFilter.frequency.value = 110;
        this.bassFilter.gain.value = 4; // default subtle bass warmth

        // Temporal Echo Delay
        this.delayNode = this.ctx.createDelay(1.5);
        this.delayNode.delayTime.value = 0.28; // 280ms cinematic slap/void
        this.delayFeedbackGain = this.ctx.createGain();
        this.delayFeedbackGain.gain.value = 0.35;
        this.delayMixGain = this.ctx.createGain();
        this.delayMixGain.gain.value = 0.2;

        this.dryGain = this.ctx.createGain();
        this.dryGain.gain.value = 1.0;

        // Analyser for visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        // Master output gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1.0;

        // Connections:
        // Source -> BassFilter -> DryGain -> MasterGain -> Analyser -> Destination
        //                     -> DelayNode -> Feedback -> DelayNode
        //                                  -> DelayMixGain -> MasterGain
        this.mediaSourceNode.connect(this.bassFilter);

        this.bassFilter.connect(this.dryGain);
        this.dryGain.connect(this.masterGain);

        this.bassFilter.connect(this.delayNode);
        this.delayNode.connect(this.delayFeedbackGain);
        this.delayFeedbackGain.connect(this.delayNode);
        this.delayNode.connect(this.delayMixGain);
        this.delayMixGain.connect(this.masterGain);

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        this.isConnected = true;
      } catch (err) {
        console.warn('Audio node connection warning (can happen if already routed):', err);
      }
    }
  }

  public applyEffects(effects: AudioEffectSettings) {
    if (this.audioElement) {
      this.audioElement.playbackRate = Math.max(0.5, Math.min(2.0, effects.playbackRate));
    }
    if (this.bassFilter) {
      this.bassFilter.gain.value = effects.bassBoost;
    }
    if (this.delayMixGain && this.delayFeedbackGain) {
      this.delayMixGain.gain.value = effects.echoMix;
      this.delayFeedbackGain.gain.value = Math.min(0.65, effects.echoMix * 0.8);
    }
  }

  public async play(): Promise<void> {
    this.initContext();
    if (this.audioElement) {
      try {
        await this.audioElement.play();
      } catch (err) {
        console.warn('Playback interrupted or blocked:', err);
      }
    }
  }

  public pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public seek(seconds: number): void {
    if (this.audioElement && Number.isFinite(seconds)) {
      this.audioElement.currentTime = Math.max(0, Math.min(this.audioElement.duration || 0, seconds));
    }
  }

  public setVolume(volume: number): void {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public setLoop(loop: boolean): void {
    if (this.audioElement) {
      this.audioElement.loop = loop;
    }
  }

  public getDuration(): number {
    return this.audioElement?.duration || 0;
  }

  public getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  public isPaused(): boolean {
    return this.audioElement ? this.audioElement.paused : true;
  }

  public onTimeUpdate(callback: (time: number, duration: number) => void) {
    this.onTimeUpdateCallback = callback;
  }

  public onEnded(callback: () => void) {
    this.onEndedCallback = callback;
  }

  public getAudioData(frequencyData: Uint8Array, timeDomainData: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(frequencyData);
      this.analyser.getByteTimeDomainData(timeDomainData);
    }
  }

  public downloadAudio(url?: string, filename = 'voice_clip.mp3'): void {
    const targetUrl = url || this.currentUrl;
    if (!targetUrl) return;
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  public downloadWav(filename = 'voice_clip.wav'): void {
    this.downloadAudio(undefined, filename);
  }
}

export const audioEngine = new AudioEngine();
