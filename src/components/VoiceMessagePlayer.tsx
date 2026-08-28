import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Radio, Volume2, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface VoiceMessagePlayerProps {
  fileName: string;
  durationSec?: number;
  isMe?: boolean;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  fileName,
  durationSec = 6,
  isMe = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);

  // Extract duration from filename if present (e.g. Voice_Memo_Opus_48kHz_5s.opus)
  const parsedDuration = (() => {
    const match = fileName.match(/(\d+)s/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return durationSec;
  })();

  // Random stabilized waveform heights for visual realism
  const waveformBars = useRef(
    Array.from({ length: 28 }, (_, i) => {
      const v = Math.sin(i * 0.45) * 0.4 + Math.cos(i * 0.9) * 0.3 + 0.5;
      return Math.max(15, Math.min(100, Math.round(v * 90)));
    })
  ).current;

  const togglePlay = () => {
    if (isPlaying) {
      soundFx.stopVoicePlayback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      soundFx.playVoicePlayback(
        parsedDuration,
        speed,
        (pct, sec) => {
          setProgress(pct);
          setCurrentSec(sec);
        },
        () => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentSec(0);
        }
      );
    }
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (isPlaying) {
      soundFx.stopVoicePlayback();
      setIsPlaying(true);
      soundFx.playVoicePlayback(
        parsedDuration,
        nextSpeed,
        (pct, sec) => {
          setProgress(pct);
          setCurrentSec(sec);
        },
        () => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentSec(0);
        }
      );
    }
  };

  useEffect(() => {
    return () => {
      soundFx.stopVoicePlayback();
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const remaining = s % 60;
    return `${m}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`p-3 rounded-2xl border transition-all select-none ${
        isMe
          ? 'bg-cyan-950/40 border-cyan-400/30 text-cyan-50'
          : 'bg-slate-950/60 border-white/15 text-slate-100'
      } backdrop-blur-md shadow-inner space-y-2 max-w-sm`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
        <span className="flex items-center gap-1 text-cyan-300 font-semibold">
          <Radio className="w-3 h-3 text-cyan-400" />
          <span>Opus 48kHz HD Audio</span>
        </span>
        <span className="text-emerald-400 font-bold">Lossless • E2EE</span>
      </div>

      {/* Main Player Row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md ${
            isPlaying
              ? 'bg-amber-400 text-slate-950 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
              : isMe
              ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 hover:scale-105'
              : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-white/10 hover:scale-105'
          }`}
          title={isPlaying ? 'Pause Audio' : 'Play HD Voice Memo'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Bars Display */}
        <div className="flex-1 flex items-center gap-0.5 h-8 overflow-hidden">
          {waveformBars.map((heightPercent, idx) => {
            const barProgress = (idx / waveformBars.length) * 100;
            const isFilled = barProgress <= progress;

            return (
              <span
                key={idx}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isFilled
                    ? isMe
                      ? 'bg-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                      : 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                    : isMe
                    ? 'bg-cyan-900/60'
                    : 'bg-slate-700/60'
                }`}
                style={{
                  height: isPlaying
                    ? `${Math.max(12, (heightPercent * (Math.sin(currentSec * 6 + idx) + 1.2)) / 2)}%`
                    : `${Math.max(14, heightPercent)}%`,
                }}
              />
            );
          })}
        </div>

        {/* Playback Speed Pill */}
        <button
          onClick={cycleSpeed}
          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold text-cyan-300 transition-colors cursor-pointer shrink-0"
          title="Change playback speed"
        >
          {speed}x
        </button>
      </div>

      {/* Time Progress */}
      <div className="flex items-center justify-between text-[10px] font-mono opacity-80 pt-0.5">
        <span className="text-slate-300">{formatSeconds(currentSec)}</span>
        <span className="text-slate-400">{formatSeconds(parsedDuration)}</span>
      </div>
    </div>
  );
};
