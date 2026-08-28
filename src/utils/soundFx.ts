import { SoundPackType } from '../types';

/**
 * Web Audio API Sound Effects Synthesizer for MeshGuard
 * Generates tactile audio in-memory without external audio files
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private currentPack: SoundPackType = 'tactical-mesh';

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setConfig(enabled: boolean, pack: SoundPackType) {
    this.isEnabled = enabled;
    this.currentPack = pack;
  }

  public getSoundPack(): SoundPackType {
    return this.currentPack;
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled && this.currentPack !== 'silent';
  }

  // Play Message Sent Sound
  public playSend() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (this.currentPack === 'tactical-mesh') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1760, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    } else if (this.currentPack === 'soft-chime') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.setValueAtTime(659.25, t + 0.05); // E5
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    } else if (this.currentPack === 'cyber-beep') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    } else if (this.currentPack === 'retro-8bit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(587.33, t);
      osc.frequency.setValueAtTime(880, t + 0.03);
      osc.frequency.setValueAtTime(1174.66, t + 0.06);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    } else if (this.currentPack === 'sonar-sub') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(640, t + 0.12);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    } else if (this.currentPack === 'sci-fi-pulse') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.06);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Play Message Received Sound
  public playReceive() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (this.currentPack === 'tactical-mesh') {
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, t); // E5
      osc1.frequency.setValueAtTime(987.77, t + 0.06); // B5
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    } else if (this.currentPack === 'soft-chime') {
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, t); // D5
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, t + 0.07); // A5
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    } else if (this.currentPack === 'cyber-beep') {
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(800, t);
      osc1.frequency.setValueAtTime(1400, t + 0.04);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    } else if (this.currentPack === 'retro-8bit') {
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1046.5, t);
      osc1.frequency.setValueAtTime(1318.5, t + 0.04);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    } else if (this.currentPack === 'sonar-sub') {
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    } else if (this.currentPack === 'sci-fi-pulse') {
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1200, t);
      osc1.frequency.exponentialRampToValueAtTime(600, t + 0.08);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    }

    osc1.connect(gain);
    if (this.currentPack === 'soft-chime') {
      osc2.connect(gain);
      osc2.start(t + 0.07);
      osc2.stop(t + 0.25);
    }
    gain.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.35);
  }

  // Play In-App Notification Tone
  public playNotification() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = this.currentPack === 'soft-chime' 
      ? [523.25, 783.99, 1046.5] // C5 G5 C6
      : this.currentPack === 'retro-8bit'
      ? [659.25, 880, 1318.5]
      : this.currentPack === 'sonar-sub'
      ? [440, 880]
      : [880, 1174.66, 1760]; // Tactical high triple chime

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + idx * 0.06;

      osc.type = this.currentPack === 'cyber-beep' ? 'square' : this.currentPack === 'retro-8bit' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.1, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.18);
    });
  }

  // Play Urgent SOS or Mesh Warning Alarm
  public playAlertUrgent() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [0, 0.12, 0.24].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + offset;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, noteTime);
      osc.frequency.exponentialRampToValueAtTime(1400, noteTime + 0.08);

      gain.gain.setValueAtTime(0.16, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.11);
    });
  }

  // Play Radar Node Discovered / Sonar Ping
  public playNodeDiscovered() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.08);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Play Incoming Call Ringing Melody
  public playCallRing() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [659.25, 880]; // E5, A5
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + i * 0.15;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  // Play Call End / Disconnect
  public playCallEnd() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [880, 440];
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + i * 0.1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  // Play Mesh Hop Packet Relay Pulse
  public playMeshHop() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(554.37, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.08);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Play Transfer Finished Sound
  public playTransferComplete() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.25);
    });
  }

  // Play Key Ratchet / Handshake Verified
  public playCryptoVerify() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, t);
    osc.frequency.exponentialRampToValueAtTime(1318.5, t + 0.05);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Tactile Haptic Tap for UI navigation / buttons
  public playHapticTap() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.02);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  // Self-destruct message burning countdown tick
  public playSelfDestructTick() {
    if (!this.isEnabled || this.currentPack === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, t);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  // Active Voice Playback Nodes
  private activeVoiceNodes: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode; timer: any } | null = null;

  public stopVoicePlayback() {
    if (this.activeVoiceNodes) {
      try {
        this.activeVoiceNodes.osc1.stop();
        this.activeVoiceNodes.osc2.stop();
        this.activeVoiceNodes.gain.disconnect();
        clearInterval(this.activeVoiceNodes.timer);
      } catch (e) {
        // ignore
      }
      this.activeVoiceNodes = null;
    }
  }

  public playVoicePlayback(
    durationSec: number = 4,
    speedMultiplier: number = 1,
    onProgress?: (progressPercent: number, currentSec: number) => void,
    onEnd?: () => void
  ) {
    this.stopVoicePlayback();
    if (!this.isEnabled || this.currentPack === 'silent') {
      // Still simulate progress even if muted
      const totalMs = (durationSec / speedMultiplier) * 1000;
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / totalMs) * 100);
        const currSec = Math.min(durationSec, (elapsed / 1000) * speedMultiplier);
        if (onProgress) onProgress(pct, currSec);
        if (elapsed >= totalMs) {
          clearInterval(interval);
          if (onEnd) onEnd();
        }
      }, 50);
      return;
    }

    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(3.5, t);

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(220, t); // Base voice pitch

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, t); // Harmonic

    gain.gain.setValueAtTime(0.08, t);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    const actualDuration = durationSec / speedMultiplier;
    osc1.start(t);
    osc2.start(t);

    const startTime = Date.now();
    const timer = setInterval(() => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Speech modulation simulation
      const wobble = Math.sin((now - t) * 14 * speedMultiplier) * 35;
      osc1.frequency.setValueAtTime(220 + wobble, now);
      osc2.frequency.setValueAtTime(440 + wobble * 1.5, now);
      filter.frequency.setValueAtTime(1200 + Math.cos((now - t) * 8) * 400, now);

      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / (actualDuration * 1000)) * 100);
      const currSec = Math.min(durationSec, (elapsed / 1000) * speedMultiplier);
      if (onProgress) onProgress(pct, currSec);

      if (elapsed >= actualDuration * 1000) {
        this.stopVoicePlayback();
        if (onEnd) onEnd();
      }
    }, 50);

    this.activeVoiceNodes = { osc1, osc2, gain, timer };
  }
}

export const soundFx = new SoundEffectsEngine();

