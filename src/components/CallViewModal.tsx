import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Monitor, 
  Radio, 
  ShieldCheck, 
  Lock, 
  Activity, 
  Zap, 
  Volume2, 
  Sparkles,
  Maximize2,
  Sliders,
  Terminal,
  Eye,
  Crosshair
} from 'lucide-react';
import { CallSession, Chat, User } from '../types';
import { soundFx } from '../utils/soundFx';

interface CallViewModalProps {
  chat: Chat;
  isVideo: boolean;
  onEndCall: () => void;
}

type VideoFilterMode = 'natural' | 'night-vision' | 'thermal' | 'cyber-scan';

export const CallViewModal: React.FC<CallViewModalProps> = ({
  chat,
  isVideo,
  onEndCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(!isVideo);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [spatialPan, setSpatialPan] = useState(0); // -100 to 100
  const [videoFilter, setVideoFilter] = useState<VideoFilterMode>('natural');
  const [callSeconds, setCallSeconds] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const peerUser = chat.participants.find((p) => p.user.id !== 'user-me')?.user;

  useEffect(() => {
    soundFx.playCryptoVerify();
    const interval = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    // Attempt real user webcam if browser environment permits
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && isVideo) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera permission denied or iframe mock, smooth fallback
        });
    }

    return () => {
      clearInterval(interval);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatCallTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    soundFx.playSend();
    onEndCall();
  };

  const getVideoFilterClass = () => {
    switch (videoFilter) {
      case 'night-vision':
        return 'brightness-125 contrast-150 hue-rotate-90 saturate-200 sepia filter';
      case 'thermal':
        return 'invert hue-rotate-180 contrast-200 saturate-150 filter';
      case 'cyber-scan':
        return 'contrast-125 saturate-150';
      case 'natural':
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Diagnostics HUD & E2EE Verified Banner */}
      <div className="w-full max-w-5xl flex items-center justify-between z-20 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {chat.name}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
                Direct Wi-Fi Direct P2P
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{formatCallTime(callSeconds)}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Lock className="w-3 h-3" />
                <span>SRTP / AES-256-GCM E2EE</span>
              </span>
            </p>
          </div>
        </div>

        {/* Real-time WebRTC & Stream Telemetry Box */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 border border-white/10 px-3 sm:px-4 py-1.5 rounded-2xl text-xs font-mono">
          <div>
            <span className="text-slate-500 uppercase text-[9px] block">Latency</span>
            <span className="text-emerald-400 font-bold">3.8 ms</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div>
            <span className="text-slate-500 uppercase text-[9px] block">Codec</span>
            <span className="text-cyan-400 font-bold">AV1 / Opus 48k</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div>
            <span className="text-slate-500 uppercase text-[9px] block">Bitrate</span>
            <span className="text-slate-200 font-bold">12.4 Mbps</span>
          </div>
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="p-1 rounded-lg text-slate-400 hover:text-white ml-1 cursor-pointer"
            title="Toggle Detailed Stream Matrix"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Video/Audio Canvas */}
      <div className="w-full max-w-5xl flex-1 my-3 relative rounded-3xl overflow-hidden bg-slate-900/80 border border-white/15 shadow-2xl flex items-center justify-center">
        {isScreenSharing ? (
          /* Screen Sharing Simulated Tactical Stream */
          <div className="w-full h-full bg-slate-950 p-4 font-mono text-xs overflow-hidden relative flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-cyan-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider">
                  Tactical Host Terminal — Mesh Relay Protocol v4.2
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                100% Uncompressed 4K Screen Cast
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 overflow-hidden py-3 opacity-90 leading-relaxed text-[11px]">
              <p className="text-emerald-400 font-bold">&gt; meshctl node --discover-all --rf-band 5.8ghz</p>
              <p className="text-cyan-300">[OK] Wi-Fi Direct P2P link established with peer ({chat.name})</p>
              <p className="text-slate-400">[0.003s] Diffie-Hellman Key Exchange (Curve25519) complete. Zero-Knowledge session key established.</p>
              <p className="text-amber-300">[STATUS] Streaming AV1 60 FPS video @ 480 Mbps lossless rate.</p>
              <p className="text-slate-400">&gt; telemetry-monitor --poll-rate 10ms --forward-secrecy</p>
              <p className="text-emerald-300">[OK] 0 packets dropped. Jitter: 0.2ms. SNR: 44 dB.</p>
              <p className="text-purple-300">&gt; crypto-engine --verify-fingerprint {chat.e2eeRatchetState.rootKeyFingerprint}</p>
              <p className="text-emerald-400 font-bold">[VERIFIED] SHA-256 integrity match 100.000%.</p>
            </div>

            <div className="p-2 bg-slate-900/90 rounded-xl border border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>Shared Display: 3840 x 2160 @ 60 Hz</span>
              <span className="text-cyan-300">Live P2P Stream Active</span>
            </div>
          </div>
        ) : isVideo && !isCameraOff ? (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80"
              alt="Remote Video"
              className={`w-full h-full object-cover transition-all duration-300 ${getVideoFilterClass()}`}
              referrerPolicy="no-referrer"
            />

            {/* Cyber scanlines overlay */}
            {videoFilter === 'cyber-scan' && (
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-70" />
            )}

            {/* Night vision crosshair & noise */}
            {videoFilter === 'night-vision' && (
              <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/30 flex items-center justify-center">
                <Crosshair className="w-16 h-16 text-emerald-400/40" />
                <div className="absolute top-4 right-4 text-emerald-400 font-mono text-xs font-bold animate-pulse">
                  NIGHT VISION • IR ACTIVE
                </div>
              </div>
            )}

            {/* Top Left Video Badge */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-xs font-mono text-cyan-300 border border-white/15 shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Remote: 1080p @ 60fps (AV1 Full-Res)</span>
            </div>

            {/* Optical Filter Selector Pills */}
            <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md p-1 rounded-2xl border border-white/15 flex items-center gap-1">
              {[
                { id: 'natural', label: 'Natural' },
                { id: 'night-vision', label: 'Night NV' },
                { id: 'thermal', label: 'Thermal' },
                { id: 'cyber-scan', label: 'Scanline' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setVideoFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono transition-all cursor-pointer ${
                    videoFilter === f.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Voice Call Audio Graphic with Dynamic Waves */
          <div className="flex flex-col items-center justify-center space-y-6 text-center p-6">
            <div className="relative">
              <img
                src={peerUser?.avatarUrl || chat.avatar}
                alt={chat.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-cyan-500/50 shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -inset-3 rounded-3xl border-2 border-cyan-500/30 animate-ping [animation-duration:3s]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{chat.name}</h2>
              <p className="text-xs font-mono text-cyan-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>HD Voice Stream • Spatial 3D Audio Active</span>
              </p>
            </div>

            {/* Audio Waveform Spectrum */}
            <div className="flex items-center gap-1.5 h-12">
              {[8, 16, 28, 42, 35, 48, 22, 14, 38, 45, 30, 20, 40, 50, 25, 12].map((val, i) => (
                <span
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-full transition-all duration-150"
                  style={{
                    height: `${Math.max(6, (val * (Math.sin(callSeconds * 2 + i) + 1.2)) / 1.5)}px`,
                  }}
                />
              ))}
            </div>

            {/* Spatial Audio Positional Pan Slider */}
            {spatialAudio && (
              <div className="p-3 bg-slate-950/60 backdrop-blur-md rounded-2xl border border-white/10 max-w-xs w-full space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>3D Audio Pan: {spatialPan === 0 ? 'Center' : spatialPan < 0 ? `${Math.abs(spatialPan)}% Left` : `${spatialPan}% Right`}</span>
                  <span className="text-cyan-400">Binaural</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={spatialPan}
                  onChange={(e) => setSpatialPan(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* Local Picture-in-Picture User Camera */}
        {isVideo && !isCameraOff && !isScreenSharing && (
          <div className="absolute bottom-4 right-4 w-36 sm:w-52 h-24 sm:h-36 rounded-2xl overflow-hidden border-2 border-cyan-500/60 shadow-2xl bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            <div className="absolute bottom-1 left-2 text-[9px] font-mono text-white/90 bg-black/70 px-1 rounded backdrop-blur-xs">
              You (Local P2P)
            </div>
          </div>
        )}
      </div>

      {/* Detailed Diagnostics Popover */}
      {showDiagnostics && (
        <div className="w-full max-w-5xl mb-2 p-3 bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">Jitter Buffer</span>
            <span className="text-emerald-400 font-bold">0.4 ms</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">FEC Packet Recovery</span>
            <span className="text-cyan-400 font-bold">100% Guaranteed</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Diffie-Hellman Rekey</span>
            <span className="text-amber-300 font-bold">Every 60s Active</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Transport</span>
            <span className="text-emerald-400 font-bold">Wi-Fi Direct 5.8 GHz</span>
          </div>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 px-6 py-3 rounded-3xl shadow-2xl flex items-center justify-between">
        {/* Mute Toggle */}
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            soundFx.playHapticTap();
          }}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={() => {
            setIsCameraOff(!isCameraOff);
            soundFx.playHapticTap();
          }}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
            isCameraOff
              ? 'bg-slate-800 text-slate-500'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
          }`}
          title={isCameraOff ? 'Turn Video On' : 'Turn Video Off'}
        >
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={() => {
            setIsScreenSharing(!isScreenSharing);
            soundFx.playHapticTap();
          }}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
            isScreenSharing
              ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/50 shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Share Uncompressed Screen"
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* Spatial Audio Toggle */}
        <button
          onClick={() => {
            setSpatialAudio(!spatialAudio);
            soundFx.playHapticTap();
          }}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer hidden sm:flex ${
            spatialAudio
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-500'
          }`}
          title="Spatial 3D Audio Positional Engine"
        >
          <Volume2 className="w-5 h-5" />
        </button>

        {/* End Call Button */}
        <button
          onClick={handleEnd}
          className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg hover:scale-105 transition-all cursor-pointer"
          title="End Secure Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
