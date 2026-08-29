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
  Bell,
  Download,
  Cpu
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
  onOpenInstallModal?: () => void;
  onOpenProtocolHub?: () => void;
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
  onOpenInstallModal,
  onOpenProtocolHub,
  unreadNotificationsCount = 0,
  theme,
  nodesCount,
}) => {
  const [showMobileModeMenu, setShowMobileModeMenu] = React.useState(false);

  const getModeLabel = (mode: ConnectivityMode) => {
    switch (mode) {
      case 'dual-hybrid':
        return 'Dual Hybrid';
      case 'offline-mesh-only':
        return 'Offline Mesh';
      case 'internet-only':
        return 'Internet';
    }
  };

  const getModeIcon = (mode: ConnectivityMode) => {
    switch (mode) {
      case 'dual-hybrid':
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
      case 'offline-mesh-only':
        return <WifiOff className="w-3.5 h-3.5 text-emerald-400" />;
      case 'internet-only':
        return <Wifi className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <header
      id="main-app-header"
      className="h-14 sm:h-16 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl px-2 sm:px-4 flex items-center justify-between shrink-0 z-30 select-none shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] relative"
    >
      {/* Brand & Dual Mode Indicator */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0">
          <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 shadow-[0_0_8px_#34d399]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <h1 className="font-bold text-xs sm:text-base tracking-tight text-white flex items-center gap-1 drop-shadow-sm truncate">
              MeshGuard
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-mono font-medium backdrop-blur-sm shadow-sm hidden xs:inline-block">
                P2P • E2EE
              </span>
            </h1>
          </div>
          <p className="text-[9px] sm:text-[11px] text-slate-300/80 flex items-center gap-1 font-mono truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping shrink-0" />
            <span className="truncate hidden sm:inline">Zero-Knowledge Mesh</span>
            <span className="truncate sm:hidden">{nodesCount} Nodes</span>
          </p>
        </div>

        {/* Mobile Mode Switcher Dropdown Button (visible on < md screens) */}
        <div className="md:hidden relative ml-1">
          <button
            onClick={() => setShowMobileModeMenu(!showMobileModeMenu)}
            className="px-2 py-1 rounded-xl bg-slate-900/60 border border-white/10 text-[10px] font-mono text-cyan-300 flex items-center gap-1 cursor-pointer"
            title="Toggle Networking Mode"
          >
            {getModeIcon(activeMode)}
            <span className="truncate max-w-[65px]">{getModeLabel(activeMode)}</span>
          </button>

          {showMobileModeMenu && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-1 z-40 space-y-1 text-xs font-mono">
              <button
                onClick={() => {
                  onModeChange('dual-hybrid');
                  setShowMobileModeMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer ${
                  activeMode === 'dual-hybrid' ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dual Hybrid</span>
              </button>
              <button
                onClick={() => {
                  onModeChange('offline-mesh-only');
                  setShowMobileModeMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer ${
                  activeMode === 'offline-mesh-only' ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offline Mesh</span>
              </button>
              <button
                onClick={() => {
                  onModeChange('internet-only');
                  setShowMobileModeMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer ${
                  activeMode === 'internet-only' ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/40' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                <span>Internet Relay</span>
              </button>
            </div>
          )}
        </div>

        {/* Dual Mode Switcher Pill (Desktop & Tablets >= md) */}
        <div className="hidden md:flex items-center ml-2 lg:ml-4 bg-slate-900/40 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-inner">
          <button
            id="mode-dual-btn"
            onClick={() => onModeChange('dual-hybrid')}
            className={`px-2.5 lg:px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-2.5 lg:px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-2.5 lg:px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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

        {/* Tactical Protocol Suite (DTN, Sender Keys, ARQ, PoW, Cover Traffic, Native Bridge) */}
        {onOpenProtocolHub && (
          <button
            id="open-protocol-hub-btn"
            onClick={onOpenProtocolHub}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            title="Tactical Protocol Suite (DTN Routing, Sender Keys, Low-MTU ARQ, PoW, Cover Traffic)"
          >
            <Cpu className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="hidden xl:inline">Protocols</span>
          </button>
        )}

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

        {/* Install Standalone App Trigger */}
        {onOpenInstallModal && (
          <button
            id="open-install-app-btn"
            onClick={onOpenInstallModal}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            title="Install MeshGuard as Native Standalone App (Works Offline Without Wi-Fi)"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden xl:inline">Install App</span>
          </button>
        )}

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
