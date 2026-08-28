import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Share2, 
  HardDrive, 
  Check, 
  Copy, 
  X, 
  Crown, 
  Shield, 
  Lock, 
  Zap, 
  Radio, 
  FileText, 
  Film,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Chat, ChatParticipant, RoleType, User } from '../types';

interface GroupHubDrawerProps {
  chat: Chat;
  currentUser: User;
  onClose: () => void;
  onUpdateRole?: (userId: string, newRole: RoleType) => void;
}

export const GroupHubDrawer: React.FC<GroupHubDrawerProps> = ({
  chat,
  currentUser,
  onClose,
  onUpdateRole,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'media' | 'permissions' | 'share'>('members');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const inviteLink = `meshguard://join-e2ee-group/${chat.id}?key=${chat.e2eeRatchetState.rootKeyFingerprint}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-neutral-700"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="text-sm font-bold text-neutral-100 truncate max-w-[180px]">
              {chat.name}
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono">
              {chat.isGroup ? `${chat.participants.length} Active Nodes` : 'Direct P2P E2EE'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-2 bg-neutral-900 border-b border-neutral-800 text-xs">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'bg-neutral-800 text-cyan-300 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Members
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'media'
              ? 'bg-neutral-800 text-amber-300 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          RAW Media
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'bg-neutral-800 text-emerald-300 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Permissions
        </button>

        <button
          onClick={() => setActiveTab('share')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'share'
              ? 'bg-neutral-800 text-purple-300 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Mesh Invite
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-neutral-400 flex items-center justify-between">
              <span>Mesh Participants ({chat.participants.length})</span>
              <span className="text-cyan-400 text-[10px]">Zero-Knowledge</span>
            </div>

            <div className="space-y-2">
              {chat.participants.map((p) => (
                <div
                  key={p.user.id}
                  className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <img
                        src={p.user.avatarUrl}
                        alt={p.user.name}
                        className="w-9 h-9 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-1 ring-neutral-950 ${
                          p.user.presence === 'mesh-direct' ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-neutral-200 truncate">
                          {p.user.name}
                        </p>
                        {p.role === 'owner' ? (
                          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : p.role === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-[10px] font-mono text-neutral-400 truncate">
                        {p.user.deviceType} • {p.user.keys.identityKeyHex.substring(0, 10)}...
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 font-mono text-neutral-300 uppercase">
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RAW MEDIA HUB TAB */}
        {activeTab === 'media' && (
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-neutral-400 flex items-center justify-between">
              <span>Shared Uncompressed Files ({chat.transfersCount || 3})</span>
              <span className="text-amber-400 text-[10px]">Zero Loss</span>
            </div>

            <div className="space-y-2">
              {[
                {
                  name: 'Drone_Survey_Sector_9_RAW_4K.mov',
                  size: '2.42 GB',
                  type: '4K ProRes 422 HQ',
                  sha256: 'e3b0c44...52b855',
                  date: 'Today, 14:22',
                },
                {
                  name: 'Topographic_LiDAR_Pointcloud.las',
                  size: '1.18 GB',
                  type: 'Uncompressed Binary',
                  sha256: '9a8b7c6...4d3e2f',
                  date: 'Yesterday',
                },
                {
                  name: 'RF_Spectrum_Analysis_Log.csv',
                  size: '48.2 MB',
                  type: 'Telemetry Data',
                  sha256: '1122334...ddeeff',
                  date: 'Aug 26',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-200 truncate max-w-[170px]">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-mono text-amber-400">
                          {item.size} • {item.type}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                      VERIFIED
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-neutral-500 truncate">
                    SHA-256: {item.sha256}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERMISSIONS MATRIX TAB */}
        {activeTab === 'permissions' && (
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-neutral-400">
              Granular Role & Broadcast Permissions
            </div>

            <div className="space-y-2 text-xs">
              {[
                { title: 'Send Uncompressed RAW Files', desc: 'Allows members to stream uncompressed ProRes & DNG', enabled: true },
                { title: 'Transmit Encrypted Messages', desc: 'Allows direct text and voice memo transmission', enabled: true },
                { title: 'Add Direct Mesh Nodes', desc: 'Allow members to invite peers discovered on RF radar', enabled: false },
                { title: 'Pin Cryptographic Announcements', desc: 'Allows pinning keys and warnings to top of chat', enabled: true },
                { title: 'Modify Channel Parameters', desc: 'Change channel title, icon, and mesh broadcast frequency', enabled: false },
              ].map((perm, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="pr-3">
                    <p className="font-bold text-neutral-200">{perm.title}</p>
                    <p className="text-[11px] text-neutral-400">{perm.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={perm.enabled}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESH INVITE / SHARE TAB */}
        {activeTab === 'share' && (
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase text-neutral-400">
              Encrypted Mesh Invitation Token
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-purple-500/40 space-y-3">
              <p className="text-xs text-neutral-300 leading-relaxed">
                Peers can scan this link offline via Bluetooth Low Energy or Wi-Fi Direct to securely join this encrypted mesh cluster with zero internet required.
              </p>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-cyan-300 break-all select-all">
                meshguard://join-cluster/{chat.id}?key={chat.e2eeRatchetState.rootKeyFingerprint}
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied to Clipboard' : 'Copy Offline Invite Link'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
