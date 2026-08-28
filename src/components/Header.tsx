import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Radio, 
  ShieldCheck, 
  Sliders, 
  User as UserIcon, 
  Zap, 
  BookOpen, 
  Layers,
  Activity,
  HardDrive,
  Bell
} from 'lucide-react';
import { ConnectivityMode, User, CustomThemeSettings } from '../types';

interface HeaderProps {
  currentUser: User;
  activeMode: ConnectivityMode;
  onModeChange: (mode: ConnectivityMode) => void;
  onOpenRadar: () => void;
  onOpenTransfer: () => void;
  onOpenSecurity: () => void;
  onOpenAppCustomizer: () => void;
  onOpenProfileCustomizer: () => void;
  onOpenArchitecture: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  theme: CustomThemeSettings;
  nodesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeMode,
  onModeChange,
  onOpenRadar,
  onOpenTransfer,
  onOpenSecurity,
  onOpenAppCustomizer,
  onOpenProfileCustomizer,
  onOpenArchitecture,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  theme,
  nodesCount,
}) => {
  return (
    <header
      id="main-app-header"
      className="h-14 sm:h-16 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl px-2.5 sm:px-4 flex items-center justify-between shrink-0 z-30 select-none shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]"
    >
      {/* Brand & Dual Mode Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0">
          <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 shadow-[0_0_8px_#34d399]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1 drop-shadow-sm truncate">
              MeshGuard
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-mono font-medium backdrop-blur-sm shadow-sm hidden xs:inline-block">
                P2P • E2EE
              </span>
            </h1>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-300/80 flex items-center gap-1 font-mono truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping shrink-0" />
            <span className="truncate">Zero-Knowledge Mesh</span>
          </p>
        </div>

        {/* Dual Mode Switcher Pill */}
        <div className="hidden md:flex items-center ml-4 bg-slate-900/40 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-inner">
          <button
            id="mode-dual-btn"
            onClick={() => onModeChange('dual-hybrid')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'dual-hybrid'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            title="Auto-switch between Local Mesh & Cloud Relay"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dual Hybrid</span>
          </button>

          <button
            id="mode-mesh-btn"
            onClick={() => onModeChange('offline-mesh-only')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'offline-mesh-only'
                ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            title="Bluetooth Low Energy & Wi-Fi Direct Offline Only"
          >
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>Offline Mesh</span>
          </button>

          <button
            id="mode-internet-btn"
            onClick={() => onModeChange('internet-only')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'internet-only'
                ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            title="Internet Cloud Relay Only"
          >
            <Wifi className="w-3.5 h-3.5 text-indigo-400" />
            <span>Internet</span>
          </button>
        </div>
      </div>

      {/* Center RF Spectrum & Mesh Stats */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-200 bg-slate-900/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 font-mono shadow-sm">
        <button
          onClick={onOpenRadar}
          className="flex items-center gap-2 hover:text-cyan-300 transition-colors cursor-pointer group"
          title="Open Mesh Radar"
        >
          <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>
            <strong className="text-emerald-400">{nodesCount}</strong> Peers in RF Range
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">-38 dBm (Direct)</span>
        </button>
      </div>

      {/* Right Action Icons & Profile (Fully visible and responsive on mobile) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Architecture & Specs Blueprint */}
        <button
          id="open-architecture-btn"
          onClick={onOpenArchitecture}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/30 text-xs font-medium transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
          title="System Architecture, Security & Specifications"
        >
          <BookOpen className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Architecture & Specs</span>
        </button>

        {/* Mesh Radar Scanner Button */}
        <button
          id="open-radar-btn"
          onClick={onOpenRadar}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-emerald-400 border border-white/10 hover:border-emerald-400/30 transition-all relative backdrop-blur-md cursor-pointer"
          title="Mesh Radar & RF Topology"
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </button>

        {/* Uncompressed File Sharing Hub */}
        <button
          id="open-file-transfer-btn"
          onClick={onOpenTransfer}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-amber-400 border border-white/10 hover:border-amber-400/30 transition-all backdrop-blur-md cursor-pointer"
          title="Uncompressed P2P File & Video Hub"
        >
          <HardDrive className="w-4 h-4 text-amber-400" />
        </button>

        {/* E2EE & Zero-Knowledge Vault */}
        <button
          id="open-security-btn"
          onClick={onOpenSecurity}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-400/30 transition-all backdrop-blur-md cursor-pointer"
          title="E2EE Keys & Zero-Knowledge Vault"
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Tactical Notification Center Trigger */}
        <button
          id="open-notifications-btn"
          onClick={onOpenNotifications}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-400/30 transition-all relative backdrop-blur-md cursor-pointer"
          title="Tactical Notification Center"
        >
          <Bell className="w-4 h-4 text-cyan-400" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-cyan-500 text-slate-950 font-bold font-mono text-[9px] shadow-sm">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Complete App Customization & Themes Engine */}
        <button
          id="open-customizer-btn"
          onClick={onOpenAppCustomizer}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-purple-400 border border-white/10 hover:border-purple-400/30 transition-all backdrop-blur-md cursor-pointer"
          title="Complete App UI Customization & Theming Engine"
        >
          <Sliders className="w-4 h-4 text-purple-400" />
        </button>

        {/* User Profile Avatar Trigger */}
        <button
          id="open-profile-btn"
          onClick={onOpenProfileCustomizer}
          className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-2.5 sm:py-1 rounded-xl sm:rounded-2xl bg-slate-900/50 hover:bg-slate-800/60 border border-white/10 hover:border-cyan-400/40 transition-all backdrop-blur-md cursor-pointer"
          title="Profile & Identity Customizer"
        >
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl object-cover ring-1 ring-cyan-400/40"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
          </div>
          <span className="hidden lg:inline text-xs font-semibold text-slate-200">
            {currentUser.name}
          </span>
        </button>
      </div>
    </header>
  );
};
