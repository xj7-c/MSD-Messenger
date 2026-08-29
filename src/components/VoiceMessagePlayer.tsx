import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Radio, Volume2, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface VoiceMessagePlayerProps {
  fileName: string;
  durationSec?: number;
  isMe?: boolean;
  audioUrl?: string;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  fileName,
  durationSec = 6,
  isMe = false,
  audioUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Extract duration from filename if present (e.g. Voice_Memo_Opus_48kHz_5s.opus)
  const parsedDuration = (() => {
    const match = fileName.match(/(\d+)s/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return durationSec;
  })();

  const [totalDuration, setTotalDuration] = useState(parsedDuration);

  // Random stabilized waveform heights for visual realism
  const waveformBars = useRef(
    Array.from({ length: 30 }, (_, i) => {
      const v = Math.sin(i * 0.45) * 0.4 + Math.cos(i * 0.9) * 0.3 + 0.5;
      return Math.max(15, Math.min(100, Math.round(v * 90)));
    })
  ).current;

  // Initialize and handle HTML Audio Element
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.preload = 'metadata';
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setTotalDuration(Math.round(audio.duration));
        }
      };

      audio.ontimeupdate = () => {
        const dur = audio.duration || totalDuration || 1;
        const cur = audio.currentTime;
        setCurrentSec(cur);
        setProgress(Math.min(100, (cur / dur) * 100));
      };

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentSec(0);
      };

      audio.onerror = () => {
        console.warn('Audio playback error, falling back to synthesizer');
      };

      return () => {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = speed;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('HTML Audio play error, falling back to Web Audio:', err);
          fallbackSynthPlay();
        });
      }
    } else {
      fallbackSynthPlay();
    }
  };

  const fallbackSynthPlay = () => {
    if (isPlaying) {
      soundFx.stopVoicePlayback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      soundFx.playVoicePlayback(
        totalDuration,
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

  const handleSeek = (index: number) => {
    const seekPct = (index / waveformBars.length) * 100;
    const targetTime = (seekPct / 100) * totalDuration;
    setProgress(seekPct);
    setCurrentSec(targetTime);

    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = targetTime;
      if (!isPlaying) {
        audioRef.current.playbackRate = speed;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      if (isPlaying) {
        soundFx.stopVoicePlayback();
        setIsPlaying(false);
      }
      setIsPlaying(true);
      soundFx.playVoicePlayback(
        Math.max(1, totalDuration - targetTime),
        speed,
        (pct, sec) => {
          const overallPct = seekPct + pct * ((100 - seekPct) / 100);
          setProgress(overallPct);
          setCurrentSec(targetTime + sec);
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
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
    if (isPlaying && !audioUrl) {
      soundFx.stopVoicePlayback();
      setIsPlaying(true);
      soundFx.playVoicePlayback(
        totalDuration,
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
          ? 'bg-cyan-950/50 border-cyan-400/40 text-cyan-50 shadow-[0_2px_12px_rgba(6,182,212,0.15)]'
          : 'bg-slate-950/70 border-white/20 text-slate-100'
      } backdrop-blur-md space-y-2 max-w-sm w-full`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between text-[10px] font-mono opacity-85">
        <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Opus 48kHz HD Voice</span>
        </span>
        <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
          Lossless • E2EE
        </span>
      </div>

      {/* Main Player Row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md active:scale-95 ${
            isPlaying
              ? 'bg-amber-400 text-slate-950 scale-105 shadow-[0_0_16px_rgba(251,191,36,0.6)]'
              : isMe
              ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 hover:scale-105'
              : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-white/15 hover:scale-105'
          }`}
          title={isPlaying ? 'Pause Audio' : 'Play HD Voice Memo'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Bars Display with Interactive Seeking */}
        <div 
          className="flex-1 flex items-center gap-0.5 h-9 overflow-hidden cursor-pointer group py-1"
          title="Click to seek"
        >
          {waveformBars.map((heightPercent, idx) => {
            const barProgress = (idx / waveformBars.length) * 100;
            const isFilled = barProgress <= progress;

            return (
              <span
                key={idx}
                onClick={() => handleSeek(idx)}
                className={`w-1 rounded-full transition-all duration-75 group-hover:opacity-90 ${
                  isFilled
                    ? isMe
                      ? 'bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.9)]'
                      : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]'
                    : isMe
                    ? 'bg-cyan-900/70 hover:bg-cyan-800'
                    : 'bg-slate-700/70 hover:bg-slate-600'
                }`}
                style={{
                  height: isPlaying
                    ? `${Math.max(16, (heightPercent * (Math.sin(currentSec * 6 + idx) + 1.2)) / 1.8)}%`
                    : `${Math.max(16, heightPercent)}%`,
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
      <div className="flex items-center justify-between text-[10px] font-mono opacity-85 pt-0.5">
        <span className="text-cyan-200 font-semibold">{formatSeconds(currentSec)}</span>
        <span className="text-slate-400">{formatSeconds(totalDuration)}</span>
      </div>
    </div>
  );
};
