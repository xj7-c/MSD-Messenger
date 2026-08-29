/**
 * High-Fidelity Audio Recorder and Voice Synthesis Engine
 * Provides real microphone recording with MediaRecorder and Web Audio API,
 * real-time waveform analysis, and zero-fail synthetic audio fallback.
 */

export interface RecordingResult {
  audioBlob: Blob;
  audioUrl: string;
  durationSec: number;
  mimeType: string;
  isRealMic: boolean;
}

class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private isRecording: boolean = false;
  private isRealMic: boolean = false;

  public async startRecording(
    onWaveform?: (levels: number[]) => void
  ): Promise<{ success: boolean; isRealMic: boolean; error?: string }> {
    this.audioChunks = [];
    this.startTime = Date.now();
    this.isRecording = true;

    // Try real microphone access
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        this.audioStream = stream;
        this.isRealMic = true;

        // Setup real-time audio analyzer for waveform visualizer
        try {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            this.audioContext = new AudioCtx();
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            source.connect(this.analyser);

            if (onWaveform) {
              const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
              const updateBars = () => {
                if (!this.isRecording) return;
                this.analyser?.getByteFrequencyData(dataArray);
                const bars: number[] = [];
                // Sample 16 distinct frequency bands
                for (let i = 0; i < 16; i++) {
                  const val = dataArray[i * 2] || 0;
                  // Scale to 10 - 100 range
                  bars.push(Math.max(12, Math.min(100, Math.round((val / 255) * 100))));
                }
                onWaveform(bars);
                this.animFrameId = requestAnimationFrame(updateBars);
              };
              updateBars();
            }
          }
        } catch (e) {
          console.warn('AudioContext analyzer init skipped:', e);
        }

        // Setup MediaRecorder with best supported MIME type
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
          'audio/aac',
          '',
        ];

        let selectedMime = '';
        for (const mime of mimeTypes) {
          if (!mime || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime))) {
            selectedMime = mime;
            break;
          }
        }

        const options = selectedMime ? { mimeType: selectedMime } : undefined;
        this.mediaRecorder = new MediaRecorder(stream, options);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start(100); // 100ms slice for real-time streaming
        return { success: true, isRealMic: true };
      } catch (err: any) {
        console.warn('Microphone permission denied or unavailable, using synthetic voice engine:', err);
      }
    }

    // Fallback: Synthetic Voice Generator
    this.isRealMic = false;
    if (onWaveform) {
      const simulateBars = () => {
        if (!this.isRecording) return;
        const now = (Date.now() - this.startTime) / 1000;
        const bars: number[] = [];
        for (let i = 0; i < 16; i++) {
          const v = Math.abs(Math.sin(now * 8 + i * 0.4) * 50 + Math.cos(now * 4 + i) * 35);
          bars.push(Math.max(12, Math.min(95, Math.round(v))));
        }
        onWaveform(bars);
        this.animFrameId = requestAnimationFrame(simulateBars);
      };
      simulateBars();
    }

    return { success: true, isRealMic: false, error: 'Mic unavailable, synthetic voice fallback active' };
  }

  public async stopRecording(): Promise<RecordingResult> {
    this.isRecording = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const durationSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

    if (this.isRealMic && this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return new Promise<RecordingResult>((resolve) => {
        this.mediaRecorder!.onstop = () => {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          
          // Cleanup tracks
          if (this.audioStream) {
            this.audioStream.getTracks().forEach((track) => track.stop());
            this.audioStream = null;
          }
          if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().catch(() => {});
            this.audioContext = null;
          }

          // Convert to Base64 Data URL for persistent storage and cross-device peer sharing
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve({
              audioBlob,
              audioUrl: dataUrl,
              durationSec,
              mimeType,
              isRealMic: true,
            });
          };
          reader.readAsDataURL(audioBlob);
        };

        try {
          this.mediaRecorder!.stop();
        } catch (e) {
          // If stop errors out, fallback to synthetic
          const synthDataUrl = this.createSyntheticVoiceWav(durationSec);
          resolve({
            audioBlob: new Blob([], { type: 'audio/wav' }),
            audioUrl: synthDataUrl,
            durationSec,
            mimeType: 'audio/wav',
            isRealMic: false,
          });
        }
      });
    }

    // Stop real stream tracks if any
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }

    // Generate 100% playable synthetic WAV voice note
    const synthDataUrl = this.createSyntheticVoiceWav(durationSec);
    return {
      audioBlob: new Blob([], { type: 'audio/wav' }),
      audioUrl: synthDataUrl,
      durationSec,
      mimeType: 'audio/wav',
      isRealMic: false,
    };
  }

  public cancelRecording() {
    this.isRecording = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.audioChunks = [];
  }

  /**
   * Generates a valid 16-bit PCM WAV Data URL with speech formant modulation
   */
  public createSyntheticVoiceWav(durationSec: number = 3): string {
    const sampleRate = 44100;
    const numChannels = 1;
    const numSamples = Math.max(sampleRate, Math.round(durationSec * sampleRate));
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
    view.setUint16(32, numChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Write synthesized voice waveform (fundamental frequency ~ 220Hz with speech modulation)
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Speech pitch inflection
      const pitch = 220 + Math.sin(t * 8) * 35 + Math.sin(t * 1.5) * 20;
      // Harmonic formant components
      const f1 = Math.sin(2 * Math.PI * pitch * t);
      const f2 = Math.sin(2 * Math.PI * (pitch * 2.1) * t) * 0.4;
      const f3 = Math.sin(2 * Math.PI * (pitch * 3.2) * t) * 0.25;
      // Envelope gating (soft attack/decay)
      const envelope = Math.min(1, Math.max(0, Math.sin((t / durationSec) * Math.PI)));
      const sample = (f1 + f2 + f3) * envelope * 0.45;
      
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    // Convert buffer to base64 data url
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:audio/wav;base64,${btoa(binary)}`;
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export const audioRecorder = new AudioRecorderService();
