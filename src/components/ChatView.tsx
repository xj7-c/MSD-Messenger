import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Phone, 
  Video, 
  ShieldCheck, 
  Lock, 
  Info, 
  Radio, 
  HardDrive, 
  Play, 
  Check, 
  CheckCheck, 
  Clock, 
  Flame, 
  Download, 
  Sparkles, 
  CornerDownRight, 
  Eye, 
  FileText, 
  ChevronDown,
  Layers,
  Zap,
  Share2,
  ArrowLeft,
  Search,
  X,
  Copy,
  SmilePlus,
  Volume2
} from 'lucide-react';
import { Chat, Message, User, CustomThemeSettings, FileAttachment } from '../types';
import { MessageComposer } from './MessageComposer';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { soundFx } from '../utils/soundFx';
import { renderMessageWithEmojis, getCustomEmojiByCode } from '../utils/emojiParser';

interface ChatViewProps {
  chat: Chat;
  currentUser: User;
  messages: Message[];
  onSendMessage: (
    content: string, 
    file?: FileAttachment, 
    selfDestructSec?: number, 
    quoteMessage?: { id: string; senderName: string; content: string }
  ) => void;
  onStartVoiceCall: (chat: Chat) => void;
  onStartVideoCall: (chat: Chat) => void;
  onOpenSecurity: () => void;
  onOpenGroupHub: () => void;
  onOpenTransferModal: () => void;
  theme: CustomThemeSettings;
  onReaction: (messageId: string, emoji: string) => void;
  onBack?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chat,
  currentUser,
  messages,
  onSendMessage,
  onStartVoiceCall,
  onStartVideoCall,
  onOpenSecurity,
  onOpenGroupHub,
  onOpenTransferModal,
  theme,
  onReaction,
  onBack,
}) => {
  const [inspectCipherId, setInspectCipherId] = useState<string | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'media' | 'voice' | 'ephemeral'>('all');
  const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; content: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  
  // Real-time ticking for self-destruct burning messages
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUser = chat.participants.find((p) => p.user.id !== currentUser.id && p.user.id !== 'user-me')?.user;

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter messages according to search & filter pills
  const filteredMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);

      // Filter by type
      if (filterType === 'media' && !m.fileAttachment) return false;
      if (filterType === 'voice' && (!m.fileAttachment || m.fileAttachment.mimeType !== 'audio/opus')) return false;
      if (filterType === 'ephemeral' && !m.selfDestructSec) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const contentMatch = m.content.toLowerCase().includes(q);
        const senderMatch = m.senderName.toLowerCase().includes(q);
        const fileMatch = m.fileAttachment?.fileName.toLowerCase().includes(q);
        return contentMatch || senderMatch || fileMatch;
      }
      return true;
    });
  }, [messages, searchQuery, filterType]);

  useEffect(() => {
    if (!searchOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages.length, searchOpen]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    soundFx.playHapticTap();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReplyClick = (msg: Message) => {
    setReplyingTo({
      id: msg.id,
      senderName: msg.senderName,
      content: msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content,
    });
    soundFx.playHapticTap();
  };

  const scrollToQuotedMessage = (targetMsgId: string) => {
    const el = document.getElementById(`message-${targetMsgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(targetMsgId);
      setTimeout(() => setHighlightedMessageId(null), 2500);
      soundFx.playHapticTap();
    }
  };

  const getBubbleClasses = (isMe: boolean) => {
    const style = theme.bubbleStyle;
    if (style === 'cyber-angular') {
      return isMe
        ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white border border-cyan-300/40 border-r-4 border-r-cyan-200 rounded-tl-2xl rounded-bl-2xl rounded-tr-xs rounded-br-none shadow-[0_4px_24px_rgba(6,182,212,0.35)]'
        : 'bg-slate-900/80 backdrop-blur-xl text-slate-100 border border-white/15 border-l-4 border-l-cyan-400 rounded-tr-2xl rounded-br-2xl rounded-tl-xs rounded-bl-none shadow-md';
    }
    if (style === 'minimal') {
      return isMe
        ? 'bg-cyan-600 text-white rounded-md border border-cyan-400 shadow-sm'
        : 'bg-slate-900/90 text-slate-100 rounded-md border border-white/15 shadow-sm';
    }
    if (style === 'glassmorphic') {
      return isMe
        ? 'bg-gradient-to-br from-cyan-500/90 to-teal-600/90 backdrop-blur-2xl text-white border border-cyan-300/50 rounded-3xl rounded-tr-xs shadow-[0_8px_32px_rgba(6,182,212,0.35)]'
        : 'bg-slate-900/75 backdrop-blur-2xl text-slate-100 border border-white/15 rounded-3xl rounded-tl-xs shadow-[0_8px_32px_rgba(0,0,0,0.35)]';
    }
    // Default rounded high-contrast
    return isMe
      ? 'bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 text-white rounded-2xl rounded-tr-xs border border-cyan-300/40 shadow-[0_4px_20px_rgba(6,182,212,0.35)] font-normal'
      : 'bg-slate-900/85 backdrop-blur-xl text-slate-100 rounded-2xl rounded-tl-xs border border-white/15 shadow-md font-normal';
  };

  return (
    <div id="active-chat-view" className="flex-1 flex flex-col h-full bg-slate-950/20 relative overflow-hidden select-none">
      {/* Active Chat Top Header */}
      <div className="h-16 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 md:hidden cursor-pointer"
              title="Back to conversations"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="relative shrink-0 cursor-pointer" onClick={onOpenGroupHub}>
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover ring-1 ring-white/20 shadow-md"
              referrerPolicy="no-referrer"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                chat.isGroup ? 'bg-purple-400' : otherUser?.presence === 'mesh-direct' ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-cyan-300 transition-colors drop-shadow-sm" onClick={onOpenGroupHub}>
                {chat.name}
              </h2>
              <button
                onClick={onOpenSecurity}
                className="px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-[9px] sm:text-[10px] font-mono flex items-center gap-1 cursor-pointer hover:bg-cyan-500/25 transition-colors backdrop-blur-sm shadow-sm shrink-0"
                title="Double Ratchet E2EE Verified. Click to view cryptographic audit."
              >
                <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">#{chat.e2eeRatchetState.ratchetStep}</span>
              </button>
            </div>

            <p className="text-[10px] sm:text-[11px] text-slate-300/80 flex items-center gap-1.5 font-mono truncate">
              {chat.isGroup ? (
                <span>{chat.participants.length} Active Mesh Nodes</span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
                  <span className="truncate">Wi-Fi Direct P2P (480 Mbps)</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Thread Search Trigger */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-2 rounded-xl transition-all cursor-pointer backdrop-blur-md ${
              searchOpen
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                : 'bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-white border border-white/10'
            }`}
            title="Search In-Thread Encrypted Messages"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Uncompressed Transfer Button */}
          <button
            id="chat-send-uncompressed-btn"
            onClick={onOpenTransferModal}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-sm"
            title="Stream Uncompressed 4K/RAW File to Peer"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline font-medium text-amber-200">Send RAW</span>
          </button>

          {/* Voice Call */}
          <button
            id="chat-start-voice-call-btn"
            onClick={() => onStartVoiceCall(chat)}
            className="p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-emerald-400 border border-white/10 hover:border-emerald-400/30 transition-all cursor-pointer backdrop-blur-md"
            title="Start Low-Latency HD Mesh Voice Call (Opus 48kHz)"
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Video Call */}
          <button
            id="chat-start-video-call-btn"
            onClick={() => onStartVideoCall(chat)}
            className="p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-400/30 transition-all cursor-pointer backdrop-blur-md"
            title="Start HD Peer-to-Peer Video Call (AV1 / 60 FPS)"
          >
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Group / Channel Info Hub */}
          <button
            id="chat-open-group-hub-btn"
            onClick={onOpenGroupHub}
            className="p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-purple-400 border border-white/10 hover:border-purple-400/30 transition-all cursor-pointer backdrop-blur-md"
            title="Open Channel Info, Roles & Shared Media Hub"
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* In-Thread Search & Filter Bar */}
      {searchOpen && (
        <div className="p-2.5 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 z-20 animate-in slide-in-from-top-2 duration-150">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages, files or hashes..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-900/60 text-xs text-white placeholder-slate-400 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400 font-sans"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'media', label: 'RAW Files' },
              { id: 'voice', label: 'Voice Memos' },
              { id: 'ephemeral', label: 'Ephemeral' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
                setFilterType('all');
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white ml-1 cursor-pointer"
              title="Close Search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* E2EE Zero-Knowledge Verification Announcement */}
        <div className="max-w-md mx-auto my-2 p-3 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-cyan-400/20 text-center text-xs text-slate-300 space-y-1 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted & Zero-Knowledge</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Messages, calls, and full-resolution uncompressed files are secured with the Double Ratchet protocol. No server or relay holds private keys.
          </p>
          <div className="pt-1 flex items-center justify-center gap-2 font-mono text-[10px] text-cyan-400">
            <span>Safety Fingerprint:</span>
            <span className="text-slate-200">{chat.e2eeRatchetState.rootKeyFingerprint}</span>
          </div>
        </div>

        {/* Messages List */}
        {filteredMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id || msg.senderId === 'user-me';
          const bubbleClasses = getBubbleClasses(isMe);
          const isInspectingCipher = inspectCipherId === msg.id;
          const isHighlighted = highlightedMessageId === msg.id;

          // Compute self-destruct burning state
          let remainingSec: number | null = null;
          let isBurned = msg.isBurned || false;

          if (msg.selfDestructSec) {
            const expiresAt = msg.expiresAt || msg.timestamp + msg.selfDestructSec * 1000;
            const diffSec = Math.max(0, Math.floor((expiresAt - nowTimestamp) / 1000));
            remainingSec = diffSec;
            if (diffSec <= 0) {
              isBurned = true;
            }
          }

          // If message burned
          if (isBurned) {
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-2 opacity-60 animate-in fade-in duration-300`}
              >
                <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-dashed border-red-500/40 text-[11px] font-mono text-red-300 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>[Message Ephemerally Burned with Zero-Knowledge Dust]</span>
                </div>
              </div>
            );
          }

          const isVoiceMemo = msg.fileAttachment?.mimeType === 'audio/opus';

          return (
            <div
              key={msg.id}
              id={`message-${msg.id}`}
              className={`w-full flex flex-col ${isMe ? 'items-end' : 'items-start'} group space-y-1 transition-all duration-300 ${
                isHighlighted ? 'ring-2 ring-cyan-400 rounded-2xl p-1 bg-cyan-950/30' : ''
              }`}
            >
              {/* Sender Name for Groups */}
              {chat.isGroup && !isMe && (
                <div className="flex items-center gap-1.5 pl-1 text-[11px] font-medium text-slate-400">
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-4 h-4 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span>{msg.senderName}</span>
                </div>
              )}

              {/* Message Bubble Card */}
              <div className={`max-w-[88%] sm:max-w-md md:max-w-lg p-3 sm:p-3.5 ${bubbleClasses} transition-all relative`}>
                {/* Ephemeral Burning Countdown Bar */}
                {remainingSec !== null && (
                  <div className="mb-2 px-2.5 py-1 rounded-xl bg-amber-950/70 border border-amber-500/50 text-[10px] font-mono text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Flame className="w-3 h-3 text-amber-400 animate-bounce" />
                      <span>Self-Destruct in {remainingSec}s</span>
                    </span>
                    <span className="text-[9px] text-amber-400/80">Forward Secrecy</span>
                  </div>
                )}

                {/* Quoted Message Card if replying */}
                {msg.quoteMessage && (
                  <div
                    onClick={() => msg.quoteMessage?.id && scrollToQuotedMessage(msg.quoteMessage.id)}
                    className={`mb-2 p-2 rounded-xl text-xs space-y-0.5 cursor-pointer transition-all ${
                      isMe
                        ? 'bg-black/30 border-l-2 border-white text-white hover:bg-black/40'
                        : 'bg-slate-950/60 border-l-2 border-cyan-400 text-slate-200 hover:bg-slate-950/80'
                    }`}
                    title="Click to view original message"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold font-mono ${isMe ? 'text-cyan-200' : 'text-cyan-400'}`}>
                        ↳ {msg.quoteMessage.senderName}
                      </span>
                      <CornerDownRight className="w-3 h-3 opacity-60" />
                    </div>
                    <p className="line-clamp-2 text-[11px] opacity-90">
                      {msg.quoteMessage.content}
                    </p>
                  </div>
                )}

                {/* Voice Message Player */}
                {isVoiceMemo && msg.fileAttachment ? (
                  <VoiceMessagePlayer
                    fileName={msg.fileAttachment.fileName}
                    isMe={isMe}
                  />
                ) : msg.fileAttachment ? (
                  /* Standard Uncompressed File Attachment Card */
                  <div className={`mb-2 p-2.5 rounded-2xl backdrop-blur-md space-y-2 shadow-inner ${
                    isMe ? 'bg-black/25 border border-white/20' : 'bg-slate-950/60 border border-amber-400/30'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shrink-0">
                          <HardDrive className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {msg.fileAttachment.fileName}
                          </p>
                          <p className="text-[10px] font-mono text-amber-200/90 flex items-center gap-1.5 truncate">
                            <span>{msg.fileAttachment.formattedSize}</span>
                            <span>•</span>
                            <span>{msg.fileAttachment.rawDimensions || 'Uncompressed Binary'}</span>
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-mono font-semibold shrink-0">
                        100% RAW
                      </span>
                    </div>

                    {/* Media Preview if available */}
                    {msg.fileAttachment.previewUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/40 group/media">
                        <img
                          src={msg.fileAttachment.previewUrl}
                          alt={msg.fileAttachment.fileName}
                          className="w-full max-h-60 object-contain mx-auto rounded-lg"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity gap-2">
                          <button
                            onClick={() => setPreviewMediaUrl(msg.fileAttachment?.previewUrl || null)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer flex items-center gap-1 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          {msg.fileAttachment.previewUrl && (
                            <a
                              href={msg.fileAttachment.previewUrl}
                              download={msg.fileAttachment.fileName}
                              className="px-3 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer flex items-center gap-1 text-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SHA-256 Bit-for-Bit Hash Verification Badge */}
                    <div className="p-2 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/10 text-[10px] font-mono space-y-0.5">
                      <div className="flex items-center justify-between text-emerald-400">
                        <span className="flex items-center gap-1 truncate">
                          <Check className="w-3 h-3 shrink-0" />
                          <span className="truncate">SHA-256 (Bit-for-Bit)</span>
                        </span>
                        {msg.fileAttachment.previewUrl && (
                          <a
                            href={msg.fileAttachment.previewUrl}
                            download={msg.fileAttachment.fileName}
                            className="text-cyan-300 hover:text-cyan-100 flex items-center gap-1 font-semibold shrink-0 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Save File</span>
                          </a>
                        )}
                      </div>
                      <p className="text-slate-300 truncate select-all">
                        {msg.fileAttachment.sha256Checksum}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Text Content with Rich Custom Emoji Parser (if not pure voice header) */}
                {(!isVoiceMemo || !msg.content.startsWith('🎤')) && (
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text font-sans">
                    {renderMessageWithEmojis(msg.content)}
                  </div>
                )}

                {/* Metadata row: Transport, Relay Hops, Time, Status */}
                <div className={`mt-1.5 pt-1 border-t border-current/15 flex items-center justify-between gap-2 text-[10px] font-mono ${
                  isMe ? 'text-cyan-100/90' : 'text-slate-400'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {msg.transportProtocol === 'Wi-Fi Direct' ? (
                      <span className={`flex items-center gap-0.5 ${isMe ? 'text-amber-200' : 'text-amber-300'}`} title="Direct Wi-Fi Direct Connection">
                        <Zap className="w-2.5 h-2.5" />
                        <span>Wi-Fi Direct</span>
                      </span>
                    ) : msg.transportProtocol === 'BLE Mesh' ? (
                      <span className={`flex items-center gap-0.5 ${isMe ? 'text-cyan-200' : 'text-cyan-300'}`} title={`Bluetooth Low Energy Mesh (${msg.hopsCount} hops)`}>
                        <Radio className="w-2.5 h-2.5" />
                        <span>BLE Mesh ({msg.hopsCount} hops)</span>
                      </span>
                    ) : (
                      <span className={`flex items-center gap-0.5 ${isMe ? 'text-cyan-100' : 'text-indigo-300'}`} title="Direct Encrypted P2P">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Encrypted P2P</span>
                      </span>
                    )}

                    {msg.relayedByNode && (
                      <span className="opacity-80">via {msg.relayedByNode}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3 h-3 text-cyan-200" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3 h-3 text-cyan-200/80" />
                        ) : (
                          <Check className="w-3 h-3 text-cyan-200/80" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ciphertext inspector preview if toggled */}
                {isInspectingCipher && (
                  <div className="mt-2 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-cyan-300 font-mono text-[10px] border border-cyan-400/40 space-y-1 shadow-inner">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Raw E2EE Ciphertext (AES-256-GCM):</span>
                      <span className="text-emerald-400">Zero-Knowledge Guaranteed</span>
                    </div>
                    <p className="break-all select-all text-slate-200">
                      {msg.encryptedPayloadSnippet}
                    </p>
                  </div>
                )}
              </div>

              {/* Reactions & Cipher Inspect & Reply Trigger Toolbar */}
              <div className="flex items-center gap-1.5 px-1 text-[11px]">
                {msg.reactions.map((r, i) => {
                  const custom = getCustomEmojiByCode(r.emoji);
                  return (
                    <button
                      key={`${msg.id}-rx-${r.emoji}-${i}`}
                      onClick={() => onReaction(msg.id, r.emoji)}
                      className="px-2 py-0.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md border border-white/10 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={custom ? `${custom.code} from ${custom.serverName}` : r.emoji}
                    >
                      {custom ? (
                        <img
                          src={custom.url}
                          alt={custom.code}
                          className="w-3.5 h-3.5 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{r.emoji}</span>
                      )}
                      <span className="text-[10px] font-mono text-slate-300">{r.count}</span>
                    </button>
                  );
                })}

                {/* Quick Add Reaction, Reply & Cipher Buttons */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/70 backdrop-blur-md p-0.5 rounded-xl border border-white/10">
                  <button
                    onClick={() => onReaction(msg.id, '🔥')}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                    title="Add 🔥"
                  >
                    🔥
                  </button>
                  <button
                    onClick={() => onReaction(msg.id, '⚡')}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                    title="Add ⚡"
                  >
                    ⚡
                  </button>
                  <button
                    onClick={() => onReaction(msg.id, '🛡️')}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                    title="Add 🛡️"
                  >
                    🛡️
                  </button>

                  <button
                    onClick={() => handleReplyClick(msg)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-300 cursor-pointer"
                    title="Quote Reply"
                  >
                    <CornerDownRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleCopyText(msg.id, msg.content)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-300 cursor-pointer"
                    title="Copy Text"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>

                  <button
                    onClick={() => setInspectCipherId(isInspectingCipher ? null : msg.id)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-300 cursor-pointer"
                    title="Inspect Zero-Knowledge Ciphertext Payload"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer with Reply Binding */}
      <MessageComposer
        onSendMessage={onSendMessage}
        onOpenTransferModal={onOpenTransferModal}
        theme={theme}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {/* Fullscreen Video / RAW Media Inspector Modal */}
      {previewMediaUrl && (
        <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-neutral-100">
                  Uncompressed 4K Stream Player (100% Zero-Loss)
                </h3>
              </div>
              <button
                onClick={() => setPreviewMediaUrl(null)}
                className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
            <img
              src={previewMediaUrl}
              alt="Full Preview"
              className="w-full max-h-[60vh] object-contain rounded-xl bg-black border border-neutral-800"
              referrerPolicy="no-referrer"
            />
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400">Resolution: 3840 x 2160 • Color: 10-bit 4:2:2 DCI-P3</span>
              <span className="text-cyan-400">P2P Stream Bitrate: 220 Mbps</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
