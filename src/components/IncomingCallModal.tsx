import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, Radio, Lock, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface IncomingCallModalProps {
  callerName: string;
  callerAvatar?: string;
  callerId: string;
  chatId: string;
  isVideoOffer: boolean;
  onAccept: (isVideo: boolean) => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callerName,
  callerAvatar,
  callerId,
  chatId,
  isVideoOffer,
  onAccept,
  onDecline,
}) => {
  const ringTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Play initial call ring tone
    soundFx.playCryptoVerify();

    // Loop ringing sound effects every 2.5 seconds
    ringTimerRef.current = setInterval(() => {
      soundFx.playCryptoVerify();
    }, 2500);

    return () => {
      if (ringTimerRef.current) {
        clearInterval(ringTimerRef.current);
      }
    };
  }, []);

  const handleAccept = (withVideo: boolean) => {
    if (ringTimerRef.current) clearInterval(ringTimerRef.current);
    soundFx.playTransferComplete();
    onAccept(withVideo);
  };

  const handleDecline = () => {
    if (ringTimerRef.current) clearInterval(ringTimerRef.current);
    soundFx.playSend();
    onDecline();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-md bg-slate-900/90 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center space-y-6 relative overflow-hidden">
        {/* Ambient pulse background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Incoming {isVideoOffer ? 'Video' : 'Voice'} Call</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>E2EE P2P</span>
          </span>
        </div>

        {/* Caller Avatar & Ringing Animation */}
        <div className="relative inline-block my-2">
          <img
            src={callerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={callerName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-cyan-400/70 shadow-2xl mx-auto"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -inset-3 rounded-full border-2 border-cyan-400 animate-ping opacity-60 pointer-events-none" />
          <span className="absolute -inset-6 rounded-full border border-cyan-400/30 animate-pulse pointer-events-none" />
        </div>

        {/* Caller Identity Details */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {callerName}
          </h2>
          <p className="text-xs font-mono text-cyan-300/90">
            Wi-Fi Direct P2P Mesh • Zero-Latency Stream
          </p>
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400 pt-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Diffie-Hellman Authenticated</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Decline Button */}
          <button
            onClick={handleDecline}
            className="py-3 px-4 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Decline</span>
          </button>

          {/* Accept Buttons */}
          {isVideoOffer ? (
            <button
              onClick={() => handleAccept(true)}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              <Video className="w-5 h-5" />
              <span>Accept Video</span>
            </button>
          ) : (
            <button
              onClick={() => handleAccept(false)}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              <span>Answer Call</span>
            </button>
          )}
        </div>

        {/* Alternative Accept Video/Audio option */}
        {isVideoOffer ? (
          <button
            onClick={() => handleAccept(false)}
            className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer block mx-auto underline decoration-dotted"
          >
            Answer with Voice Only (Camera Off)
          </button>
        ) : (
          <button
            onClick={() => handleAccept(true)}
            className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer block mx-auto underline decoration-dotted"
          >
            Answer with Video Camera
          </button>
        )}
      </div>
    </div>
  );
};
