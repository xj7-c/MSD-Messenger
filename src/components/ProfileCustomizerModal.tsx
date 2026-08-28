import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  Save, 
  X, 
  Check, 
  Radio, 
  Key, 
  Lock, 
  Zap,
  Flame,
  Award,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Link as LinkIcon
} from 'lucide-react';
import { User, UserBadge } from '../types';
import { soundFx } from '../utils/soundFx';

interface ProfileCustomizerModalProps {
  currentUser: User;
  onSaveProfile: (updated: User) => void;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  {
    id: 'preset-alex',
    name: 'Tactical Operative',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    category: 'tactical',
  },
  {
    id: 'preset-cyber-agent',
    name: 'Cyber Sentinel',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    category: 'cyber',
  },
  {
    id: 'preset-hacker-hoodie',
    name: 'Matrix Phantom',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
    category: 'cyber',
  },
  {
    id: 'preset-recon-female',
    name: 'Recon Specialist',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    category: 'tactical',
  },
  {
    id: 'preset-neon-cyborg',
    name: 'Neon Cyborg',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    category: 'cyber',
  },
  {
    id: 'preset-stealth-dr',
    name: 'Signal Architect',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    category: 'tactical',
  },
  {
    id: 'preset-anya-anime',
    name: 'Anime Operative',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80',
    category: 'anime',
  },
  {
    id: 'preset-glitch-hacker',
    name: 'Zero-Day Node',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&auto=format&fit=crop&q=80',
    category: 'cyber',
  },
];

const AVATAR_FRAMES = [
  { id: 'none', name: 'Standard Minimal', ringClass: 'ring-1 ring-neutral-700' },
  { id: 'cyber-ring', name: 'Cyber Neon Ring', ringClass: 'ring-4 ring-cyan-400 shadow-lg shadow-cyan-500/50' },
  { id: 'mesh-pulse', name: 'Mesh RF Pulse', ringClass: 'ring-4 ring-emerald-400 animate-pulse' },
  { id: 'gold-shield', name: 'Gold Anchor Shield', ringClass: 'ring-4 ring-amber-400 shadow-lg shadow-amber-500/40' },
  { id: 'stealth-matrix', name: 'Stealth Matrix', ringClass: 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/40' },
];

const BANNER_GRADIENTS = [
  { id: 'from-cyan-600 via-blue-700 to-indigo-950', name: 'Cyber Azure' },
  { id: 'from-emerald-600 via-teal-800 to-slate-950', name: 'Emerald Tactical' },
  { id: 'from-amber-600 via-orange-800 to-stone-950', name: 'Solar Amber' },
  { id: 'from-purple-600 via-indigo-900 to-neutral-950', name: 'Quantum Void' },
  { id: 'from-rose-600 via-red-800 to-neutral-950', name: 'Crimson Vector' },
];

export const ProfileCustomizerModal: React.FC<ProfileCustomizerModalProps> = ({
  currentUser,
  onSaveProfile,
  onClose,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage);
  const [statusEmoji, setStatusEmoji] = useState(currentUser.statusEmoji);
  const [avatarFrame, setAvatarFrame] = useState(currentUser.avatarFrame);
  const [bannerGradient, setBannerGradient] = useState(currentUser.bannerGradient);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
        soundFx.playSend();
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setAvatarUrl(customUrlInput.trim());
    soundFx.playSend();
    setCustomUrlInput('');
  };

  const handleResetPfp = () => {
    setAvatarUrl(currentUser.avatarUrl);
    soundFx.playSend();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name,
      handle,
      statusMessage,
      statusEmoji,
      avatarFrame: avatarFrame as any,
      bannerGradient,
      bio,
      avatarUrl,
    };
    soundFx.playCryptoVerify();
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-neutral-100">
              Advanced Profile & PFP Identity Studio
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          {/* Live Profile Card Preview */}
          <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950 shadow-inner">
            {/* Banner */}
            <div className={`h-24 bg-gradient-to-r ${bannerGradient} relative`} />

            {/* Avatar & Info Row */}
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
              <div className="flex items-end gap-3.5">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={avatarUrl}
                    alt={name}
                    className={`w-20 h-20 rounded-2xl object-cover bg-neutral-900 ${
                      AVATAR_FRAMES.find((f) => f.id === avatarFrame)?.ringClass || ''
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold">Change</span>
                  </div>
                  <span className="absolute bottom-1 right-1 text-base">{statusEmoji}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                    {name || 'Operative'}
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </h4>
                  <p className="text-xs font-mono text-cyan-400">{handle}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {statusMessage || 'Mesh Node Online'}
                </span>
              </div>
            </div>

            <div className="px-4 sm:px-5 pb-4 text-xs text-neutral-300 font-sans border-t border-neutral-900 pt-3">
              {bio || 'Zero-Knowledge E2EE Mesh Operator'}
            </div>
          </div>

          {/* CHANGE PROFILE PICTURE (PFP) SECTION */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-cyan-500/30 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Change Profile Picture (PFP)</span>
              </label>
              <button
                type="button"
                onClick={handleResetPfp}
                className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Reset to default avatar"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Direct File Upload & Drag-and-Drop */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-cyan-400/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 transition-all flex items-center justify-center gap-2.5 text-xs text-cyan-200 font-medium cursor-pointer"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Custom Photo or GIF from Device</span>
              </button>
            </div>

            {/* Quick Presets Gallery */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-neutral-400">Or choose from curated operative avatars:</span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        soundFx.playSend();
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-cyan-400 ring-2 ring-cyan-400 scale-105 shadow-md shadow-cyan-500/30'
                          : 'border-neutral-800 opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Paste direct Image or GIF URL (https://...)"
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 text-xs text-neutral-200 rounded-xl border border-neutral-800 focus:outline-none focus:border-cyan-500/60 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                disabled={!customUrlInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Apply URL
              </button>
            </div>
          </div>

          {/* Banner Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-neutral-400">
              Profile Banner Gradient
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BANNER_GRADIENTS.map((bg) => (
                <button
                  type="button"
                  key={bg.id}
                  onClick={() => setBannerGradient(bg.id)}
                  className={`h-10 sm:h-12 rounded-xl bg-gradient-to-r ${bg.id} border transition-all cursor-pointer ${
                    bannerGradient === bg.id ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105' : 'border-neutral-800'
                  }`}
                  title={bg.name}
                />
              ))}
            </div>
          </div>

          {/* Avatar Frame Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-neutral-400">
              Animated Avatar Frame FX
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVATAR_FRAMES.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setAvatarFrame(f.id as any)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    avatarFrame === f.id
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-neutral-400">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 text-xs text-neutral-100 rounded-xl border border-neutral-800 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-neutral-400">Mesh Handle</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 text-xs text-cyan-300 rounded-xl border border-neutral-800 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
            </div>
          </div>

          {/* Status Message & Emoji */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3 space-y-1">
              <label className="text-[11px] font-mono uppercase text-neutral-400">Status Indicator Message</label>
              <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="Routing packets via Wi-Fi Direct..."
                className="w-full px-3 py-2 bg-neutral-950 text-xs text-neutral-100 rounded-xl border border-neutral-800 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-neutral-400">Emoji</label>
              <input
                type="text"
                value={statusEmoji}
                onChange={(e) => setStatusEmoji(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 text-base text-center rounded-xl border border-neutral-800 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Custom Bio */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-neutral-400">Custom Bio Layout</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-neutral-950 text-xs text-neutral-100 rounded-xl border border-neutral-800 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Cryptographic Badges Section */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-neutral-400">
              Verified Cryptographic Trust Badges
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentUser.badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-xl border ${b.color} text-xs font-mono space-y-1`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>{b.label}</span>
                  </p>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Customization</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

