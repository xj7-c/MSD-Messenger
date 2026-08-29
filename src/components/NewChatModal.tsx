import React, { useState } from 'react';
import { 
  Users, 
  User as UserIcon, 
  ShieldCheck, 
  Radio, 
  Plus, 
  X, 
  Check, 
  Lock, 
  Zap,
  Sparkles
} from 'lucide-react';
import { User, Chat, MeshNode } from '../types';
import { SEED_USERS } from '../data/mockData';
import { soundFx } from '../utils/soundFx';

interface NewChatModalProps {
  currentUser: User;
  onClose: () => void;
  onCreateChat: (newChat: Chat) => void;
  meshNodes: MeshNode[];
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  currentUser,
  onClose,
  onCreateChat,
  meshNodes,
}) => {
  const [isGroup, setIsGroup] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([SEED_USERS[0].id]);

  const toggleUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && isGroup) return;

    const participantsList = [
      { user: currentUser, role: 'owner' as const, joinedAt: Date.now() },
      ...selectedUserIds.map((uid) => {
        const u = SEED_USERS.find((su) => su.id === uid) || {
          id: uid,
          name: 'Mesh Peer ' + uid.substring(0, 4),
          handle: '@peer.' + uid.substring(0, 4),
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          avatarFrame: 'cyber-ring' as const,
          bannerGradient: 'from-cyan-600 to-indigo-950',
          bio: 'Discovered offline node',
          statusMessage: 'Mesh Direct Online',
          statusEmoji: '🛰️',
          presence: 'mesh-direct' as const,
          deviceType: 'Phone' as const,
          batteryLevel: 90,
          keys: currentUser.keys,
          badges: [],
        };
        return { user: u, role: 'member' as const, joinedAt: Date.now() };
      }),
    ];

    const chatName = isGroup
      ? name.trim()
      : participantsList.find((p) => p.user.id !== currentUser.id && p.user.id !== 'user-me')?.user.name || 'Direct Session';

    const avatar = isGroup
      ? 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80'
      : participantsList.find((p) => p.user.id !== currentUser.id && p.user.id !== 'user-me')?.user.avatarUrl || currentUser.avatarUrl;

    const newChat: Chat = {
      id: 'chat-' + Date.now(),
      isGroup,
      name: chatName,
      description: isGroup ? description : undefined,
      avatar,
      ownerId: currentUser.id,
      adminIds: [currentUser.id],
      participants: participantsList,
      unreadCount: 0,
      isE2EEVerified: true,
      channelType: isGroup ? 'encrypted-group' : 'direct',
      transfersCount: 0,
      e2eeRatchetState: {
        ratchetStep: 1,
        rootKeyFingerprint: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase(),
        lastRekeyTimestamp: Date.now(),
      },
    };

    soundFx.playCryptoVerify();
    onCreateChat(newChat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-neutral-100">
              New Encrypted Session or Group
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto scrollbar-thin">
          {/* Chat Type Toggle */}
          <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-2xl border border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setIsGroup(false)}
              className={`flex-1 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isGroup
                  ? 'bg-neutral-800 text-cyan-300 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Direct P2P Session</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGroup(true)}
              className={`flex-1 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isGroup
                  ? 'bg-neutral-800 text-emerald-300 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Mesh Group Hub</span>
            </button>
          </div>

          {/* Group Name & Description if Group */}
          {isGroup && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-neutral-400">
                  Group Hub Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tactical Expedition Alpha..."
                  required
                  className="w-full px-3 py-2 bg-neutral-950 text-xs text-neutral-100 rounded-xl border border-neutral-800 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-neutral-400">
                  Cluster Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Encrypted offline team channel over BLE & Wi-Fi Direct..."
                  rows={2}
                  className="w-full px-3 py-2 bg-neutral-950 text-xs text-neutral-100 rounded-xl border border-neutral-800 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
            </div>
          )}

          {/* Participant Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-neutral-400">
              Select Mesh Peers to Invite
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
              {SEED_USERS.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-neutral-200">{user.name}</p>
                        <p className="text-[10px] font-mono text-neutral-400">{user.handle}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zero Knowledge Confirmation */}
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Automatic Double Ratchet session initialized upon creation.</span>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Start Encrypted Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
