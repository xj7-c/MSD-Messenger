import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  User as UserIcon, 
  Radio, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  WifiOff, 
  HardDrive,
  ChevronRight,
  Sparkles,
  Signal,
  Trash2
} from 'lucide-react';
import { Chat, MeshNode, User, CustomThemeSettings } from '../types';
import { Download } from 'lucide-react';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  currentUser: User;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat?: (chatId: string) => void;
  meshNodes: MeshNode[];
  onOpenRadar: () => void;
  onOpenInstallModal?: () => void;
  theme: CustomThemeSettings;
}

type TabType = 'all' | 'direct' | 'groups' | 'mesh';

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  currentUser,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  meshNodes,
  onOpenRadar,
  onOpenInstallModal,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeTab === 'direct') return !chat.isGroup;
    if (activeTab === 'groups') return chat.isGroup;
    if (activeTab === 'mesh') return chat.channelType === 'mesh-broadcast' || chat.channelType === 'offline-beacon' || !chat.isGroup;
    return true;
  });

  return (
    <aside
      id="main-sidebar"
      className="w-full md:w-72 lg:w-80 xl:w-96 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl flex flex-col h-full shrink-0 select-none overflow-hidden z-10 shadow-[4px_0_24px_0_rgba(0,0,0,0.25)]"
    >
      {/* Top Search & Actions */}
      <div className="p-3 border-b border-white/10 space-y-2.5 bg-slate-950/30">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="sidebar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats, keys, or peers..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900/60 backdrop-blur-md text-xs text-slate-100 placeholder-slate-400 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all font-sans"
            />
          </div>

          <button
            id="new-encrypted-chat-btn"
            onClick={onNewChat}
            className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Create Encrypted Mesh Group or Direct Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-slate-900/50 backdrop-blur-md p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white/15 text-white shadow-sm border border-white/15 backdrop-blur-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-cyan-500/25 text-cyan-200 shadow-sm border border-cyan-400/40 backdrop-blur-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-1 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'groups'
                ? 'bg-emerald-500/25 text-emerald-200 shadow-sm border border-emerald-400/40 backdrop-blur-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab('mesh')}
            className={`flex-1 py-1 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'mesh'
                ? 'bg-amber-500/25 text-amber-200 shadow-sm border border-amber-400/40 backdrop-blur-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mesh
          </button>
        </div>
      </div>

      {/* Live Discovered Mesh Nodes Quick Banner */}
      <div className="px-3 py-2 bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-slate-950/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono text-slate-300">
            <strong className="text-emerald-400">{meshNodes.length}</strong> Offline Nodes in Range
          </span>
        </div>
        <button
          onClick={onOpenRadar}
          className="text-[11px] font-medium text-cyan-300 hover:text-cyan-200 flex items-center gap-0.5 cursor-pointer font-mono"
        >
          <span>Radar View</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
        {filteredChats.map((chat) => {
          const isActive = chat.id === activeChatId;
          const otherParticipant = chat.participants.find(
            (p) => p.user.id !== currentUser.id && p.user.id !== 'user-me'
          )?.user || chat.participants[0]?.user;
          const displayName = chat.isGroup ? chat.name : (otherParticipant?.name || chat.name);
          const displayAvatar = chat.isGroup ? chat.avatar : (otherParticipant?.avatarUrl || chat.avatar);
          const lastMsg = chat.lastMessage;

          return (
            <div
              key={chat.id}
              className={`w-full group/chat relative flex items-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 backdrop-blur-md border-l-4 border-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.12)]'
                  : 'hover:bg-white/5'
              }`}
            >
              <button
                id={`chat-item-${chat.id}`}
                onClick={() => onSelectChat(chat.id)}
                className="flex-1 p-3 text-left flex items-start gap-3 min-w-0"
              >
                {/* Avatar with Presence and E2EE Ring */}
                <div className="relative shrink-0">
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/20 shadow-md"
                    referrerPolicy="no-referrer"
                  />

                  {/* E2EE Lock badge on avatar */}
                  <div
                    className="absolute -top-1 -left-1 p-0.5 rounded-full bg-slate-900 border border-cyan-400/60 text-cyan-300 shadow-sm"
                    title="Double Ratchet E2EE Verified"
                  >
                    <Lock className="w-2.5 h-2.5" />
                  </div>

                  {/* Presence indicator */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-slate-950 ${
                      chat.isGroup
                        ? 'bg-purple-400'
                        : otherParticipant?.presence === 'mesh-direct'
                        ? 'bg-emerald-400'
                        : otherParticipant?.presence === 'mesh-relay'
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                    }`}
                    title={
                      chat.isGroup
                        ? 'Encrypted Group Mesh'
                        : `Status: ${otherParticipant?.presence || 'online'}`
                    }
                  />
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-xs font-semibold text-slate-100 truncate">
                        {displayName}
                      </h3>
                      {chat.isGroup && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 border border-white/10 font-mono shrink-0">
                          {chat.participants.length}p
                        </span>
                      )}
                    </div>
                    {lastMsg && (
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Subtitle / Last Message */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      {lastMsg?.fileAttachment ? (
                        <span className="text-amber-300 flex items-center gap-1 font-medium">
                          <HardDrive className="w-3 h-3 shrink-0" />
                          <span>RAW File ({lastMsg.fileAttachment.formattedSize})</span>
                        </span>
                      ) : (
                        <span>{lastMsg ? lastMsg.content : 'No messages yet'}</span>
                      )}
                    </p>

                    {/* Unread badge or Protocol badge */}
                    {chat.unreadCount > 0 ? (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-400 text-slate-950 shrink-0 shadow-sm">
                        {chat.unreadCount}
                      </span>
                    ) : lastMsg?.transportProtocol ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 border border-white/10 shrink-0">
                        {lastMsg.transportProtocol === 'Wi-Fi Direct' ? '⚡ Wi-Fi' : lastMsg.transportProtocol === 'BLE Mesh' ? '📡 BLE' : '🔒 E2EE'}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>

              {/* Quick Delete Chat option on hover or active */}
              {onDeleteChat && chat.id !== 'chat-mesh-squad' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove chat "${displayName}"?`)) {
                      onDeleteChat(chat.id);
                    }
                  }}
                  className="opacity-0 group-hover/chat:opacity-100 p-2 mr-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                  title="Remove conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {filteredChats.length === 0 && (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Search className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-xs">No matching conversations found.</p>
          </div>
        )}
      </div>

      {/* Footer System Status & Install Button */}
      <div className="p-2.5 bg-slate-950/70 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Node: {currentUser.name}</span>
        </div>

        {onOpenInstallModal ? (
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 font-sans text-[10px] font-bold cursor-pointer transition-all shrink-0"
            title="Install MeshGuard as Native App for Offline Use"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>Install App</span>
          </button>
        ) : (
          <span className="text-emerald-400 shrink-0">Zero-Knowledge</span>
        )}
      </div>
    </aside>
  );
};
