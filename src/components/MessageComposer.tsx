import React, { useState, useRef, useEffect } from 'react';
import { 
  Smile, 
  Paperclip, 
  Send, 
  Mic, 
  Clock, 
  Sparkles, 
  HardDrive, 
  Zap, 
  X, 
  Square,
  Radio,
  UploadCloud,
  CornerDownRight,
  FileCode,
  Trash2
} from 'lucide-react';
import { CustomThemeSettings, FileAttachment } from '../types';
import { EmojiStickerDrawer } from './EmojiStickerDrawer';
import { soundFx } from '../utils/soundFx';
import { audioRecorder } from '../utils/audioRecorder';

interface MessageComposerProps {
  onSendMessage: (
    content: string, 
    file?: FileAttachment, 
    selfDestructSec?: number, 
    quoteMessage?: { id: string; senderName: string; content: string }
  ) => void;
  onOpenTransferModal: () => void;
  theme: CustomThemeSettings;
  replyingTo?: { id: string; senderName: string; content: string } | null;
  onCancelReply?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onOpenTransferModal,
  theme,
  replyingTo,
  onCancelReply,
}) => {
  const [content, setContent] = useState('');
  const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);
  const [selfDestructSec, setSelfDestructSec] = useState<number | undefined>(undefined);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>([20, 30, 45, 60, 40, 70, 85, 50, 60, 40, 30, 50, 65, 45, 30, 20]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isRealMicActive, setIsRealMicActive] = useState(false);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!content.trim()) return;
    onSendMessage(
      content.trim(), 
      undefined, 
      selfDestructSec, 
      replyingTo ? { id: replyingTo.id, senderName: replyingTo.senderName, content: replyingTo.content } : undefined
    );
    setContent('');
    setShowEmojiDrawer(false);
    if (onCancelReply) onCancelReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectEmoji = (code: string) => {
    setContent((prev) => (prev ? prev + ' ' + code + ' ' : code + ' '));
  };

  const handleSelectSticker = (stickerUrl: string, name: string) => {
    const file: FileAttachment = {
      id: 'sticker-' + Date.now(),
      fileName: `${name}.png`,
      fileSizeBytes: 245000,
      formattedSize: '245 KB',
      mimeType: 'image/png',
      sha256Checksum: 'a89c00b12e34f...e2ee',
      chunksTotal: 10,
      chunksCompleted: 10,
      transferProgress: 100,
      transferSpeedMbps: 450,
      isUncompressed: true,
      rawDimensions: '512x512 Lossless PNG',
      previewUrl: stickerUrl,
      isTransferring: false,
      isCompleted: true,
      e2eeVerified: true,
    };
    onSendMessage(`[Sticker: ${name}]`, file, undefined, replyingTo || undefined);
    setShowEmojiDrawer(false);
    if (onCancelReply) onCancelReply();
  };

  const processFileAndSend = (file: File) => {
    const sizeBytes = file.size || 1024000;
    const formattedSize =
      sizeBytes > 1000000000
        ? `${(sizeBytes / 1000000000).toFixed(2)} GB`
        : sizeBytes > 1000000
        ? `${(sizeBytes / 1000000).toFixed(1)} MB`
        : `${Math.round(sizeBytes / 1024)} KB`;

    const pseudoSha = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const sendAttachment = (previewUrl?: string) => {
      const attachment: FileAttachment = {
        id: 'custom-file-' + Date.now(),
        fileName: file.name,
        fileSizeBytes: sizeBytes,
        formattedSize: formattedSize,
        mimeType: file.type || 'application/octet-stream',
        sha256Checksum: pseudoSha,
        chunksTotal: Math.max(12, Math.min(100, Math.round(sizeBytes / 50000))),
        chunksCompleted: 0,
        transferProgress: 100,
        transferSpeedMbps: 480,
        isUncompressed: true,
        rawDimensions: file.type.startsWith('image/') ? 'Full-Resolution Master' : undefined,
        previewUrl: previewUrl,
        isTransferring: false,
        isCompleted: true,
        e2eeVerified: true,
      };

      onSendMessage(
        `[Attached Uncompressed File: ${file.name}]`, 
        attachment, 
        selfDestructSec, 
        replyingTo || undefined
      );
      if (onCancelReply) onCancelReply();
    };

    if (file.type.startsWith('image/') && file.size < 8 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        sendAttachment(event.target?.result as string);
      };
      reader.onerror = () => {
        sendAttachment(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      sendAttachment(URL.createObjectURL(file));
    } else {
      sendAttachment(undefined);
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFileAndSend(files[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    processFileAndSend(files[0]);
  };

  const startVoiceRecording = async () => {
    setIsRecordingAudio(true);
    setRecordingSeconds(0);
    soundFx.playSend();

    const res = await audioRecorder.startRecording((bars) => {
      setWaveformBars([...bars]);
    });
    setIsRealMicActive(res.isRealMic);

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopVoiceRecording = async (send: boolean) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecordingAudio(false);

    if (!send) {
      audioRecorder.cancelRecording();
      setRecordingSeconds(0);
      return;
    }

    try {
      const recording = await audioRecorder.stopRecording();
      const actualSec = Math.max(1, recording.durationSec || recordingSeconds);

      const voiceFile: FileAttachment = {
        id: 'voice-' + Date.now(),
        fileName: `Voice_Memo_Opus_48kHz_${actualSec}s.opus`,
        fileSizeBytes: recording.audioBlob.size || (actualSec * 16000),
        formattedSize: `${Math.max(0.05, Math.round((actualSec * 16) / 10) / 100)} MB`,
        mimeType: recording.mimeType || 'audio/webm',
        sha256Checksum: 'c4e90184b2...e2ee_verified',
        chunksTotal: 8,
        chunksCompleted: 8,
        transferProgress: 100,
        transferSpeedMbps: 480,
        isUncompressed: true,
        previewUrl: recording.audioUrl,
        streamUrl: recording.audioUrl,
        bitRate: '128 kbps Lossless Opus HD',
        isTransferring: false,
        isCompleted: true,
        e2eeVerified: true,
      };

      onSendMessage(`🎤 HD Voice Memo (${actualSec}s • Opus 48kHz)`, voiceFile);
    } catch (err) {
      console.error('Error stopping recording:', err);
    }

    setRecordingSeconds(0);
  };

  return (
    <div
      id="message-composer"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-3 border-t border-white/10 bg-slate-950/70 backdrop-blur-2xl relative transition-all ${
        isDraggingFile ? 'ring-2 ring-cyan-400 bg-cyan-950/40' : ''
      }`}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomFileUpload}
        className="hidden"
      />

      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-cyan-950/90 backdrop-blur-md border-2 border-dashed border-cyan-400 rounded-2xl flex items-center justify-center gap-2 text-cyan-200 font-mono text-xs">
          <UploadCloud className="w-6 h-6 animate-bounce text-cyan-400" />
          <span>Drop ANY uncompressed file here for direct P2P mesh transmission</span>
        </div>
      )}

      {/* Replying To Preview Card */}
      {replyingTo && (
        <div className="mb-2 p-2 rounded-xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center gap-2 truncate">
            <CornerDownRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-white mr-1.5">Replying to {replyingTo.senderName}:</span>
              <span className="text-slate-300 truncate opacity-80">{replyingTo.content}</span>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Emoji & Sticker Drawer Popup */}
      {showEmojiDrawer && (
        <div className="absolute bottom-full left-4 mb-2 z-40">
          <EmojiStickerDrawer
            onSelectEmoji={handleSelectEmoji}
            onSelectSticker={handleSelectSticker}
            onClose={() => setShowEmojiDrawer(false)}
          />
        </div>
      )}

      {/* Ephemeral Timer Bar */}
      {selfDestructSec && (
        <div className="mb-2 flex items-center justify-between px-3 py-1.5 bg-amber-500/15 backdrop-blur-md border border-amber-400/30 rounded-xl text-xs font-mono text-amber-300">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Self-destruct active: {selfDestructSec}s after read</span>
          </div>
          <button
            onClick={() => setSelfDestructSec(undefined)}
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice Recording HUD */}
      {isRecordingAudio ? (
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-2.5 sm:p-3 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-red-400/50 text-xs font-mono shadow-xl gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-red-300 font-bold flex items-center gap-1.5 truncate">
                <Mic className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />
                <span className="truncate">HD Memo: {recordingSeconds}s</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 truncate">
                {isRealMicActive ? 'Live Hardware Mic' : 'Audio Synthesizer'}
              </span>
            </div>
            {/* Live Audio Waveform Bars */}
            <div className="hidden xs:flex items-center gap-0.5 sm:gap-1 h-6 pl-1 sm:pl-2">
              {waveformBars.slice(0, 10).map((barLevel, i) => (
                <span
                  key={i}
                  className="w-0.5 sm:w-1 bg-gradient-to-t from-red-500 to-amber-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(4, (barLevel / 100) * 24)}px` }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            <button
              onClick={() => stopVoiceRecording(false)}
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer font-sans transition-colors flex items-center gap-1 text-xs"
              title="Discard Recording"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Discard</span>
            </button>
            <button
              onClick={() => stopVoiceRecording(true)}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold flex items-center gap-1 cursor-pointer font-sans shadow-md text-xs"
              title="Send Voice Memo"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      ) : (
        /* Regular Text Composer Area */
        <div className="flex items-end gap-1 sm:gap-2 bg-slate-900/50 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-white/10 focus-within:border-cyan-400/50 focus-within:ring-1 focus-within:ring-cyan-400/20 transition-all shadow-[inset_0_1px_4px_rgba(0,0,0,0.2)]">
          {/* Action Tools Left */}
          <div className="flex items-center gap-0.5 sm:gap-1 pb-1 shrink-0">
            {/* Custom Emoji Picker */}
            <button
              id="composer-emoji-btn"
              onClick={() => setShowEmojiDrawer(!showEmojiDrawer)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
              title="Universal Custom Emojis & Stickers"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Direct Device File Selector */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
              title="Attach File from Device (Zero-Loss RAW)"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Uncompressed RAW File Sharing Studio */}
            <button
              id="composer-attachment-btn"
              onClick={onOpenTransferModal}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
              title="Open RAW 4K Video & Big File Mesh Transfer Hub"
            >
              <HardDrive className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Ephemeral Timer Selector */}
            <div className="relative">
              <button
                id="composer-timer-btn"
                onClick={() => setShowTimerMenu(!showTimerMenu)}
                className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ${
                  selfDestructSec
                    ? 'text-amber-300 bg-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title="Ephemeral Self-Destruct Timer"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {showTimerMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-44 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-1 z-30 space-y-0.5 text-xs font-mono">
                  <div className="px-2 py-1 text-[10px] text-slate-400 uppercase font-semibold">
                    Self-Destruct Timer
                  </div>
                  {[
                    { label: 'Off', sec: undefined },
                    { label: '10 Seconds', sec: 10 },
                    { label: '1 Minute', sec: 60 },
                    { label: '1 Hour', sec: 3600 },
                    { label: '24 Hours', sec: 86400 },
                  ].map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelfDestructSec(t.sec);
                        setShowTimerMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center justify-between cursor-pointer"
                    >
                      <span>{t.label}</span>
                      {selfDestructSec === t.sec && <span className="text-amber-400 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Text Area */}
          <textarea
            id="message-text-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Encrypted message..."
            rows={1}
            className="flex-1 min-w-0 max-h-32 py-1.5 sm:py-2 px-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-400 resize-none focus:outline-none font-sans"
          />

          {/* Voice Record or Send Button */}
          <div className="flex items-center gap-1 pb-1 shrink-0">
            {content.trim() ? (
              <button
                id="composer-send-btn"
                onClick={handleSend}
                className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 transition-all cursor-pointer"
                title="Send Encrypted Message"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="composer-voice-record-btn"
                onClick={startVoiceRecording}
                className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                title="Hold or Click to Record HD Voice Memo"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
