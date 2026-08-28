import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Radio, 
  ShieldCheck, 
  HardDrive, 
  AlertTriangle, 
  MessageSquare, 
  CheckCheck, 
  Trash2, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Play, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Moon, 
  Sun,
  Flame
} from 'lucide-react';
import { AppNotification, NotificationCategory, SoundPackType } from '../types';
import { soundFx } from '../utils/soundFx';

interface NotificationCenterModalProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string) => void;
  onClearAll: () => void;
  onTriggerSimulate: (type: 'mesh' | 'message' | 'e2ee' | 'sos' | 'file') => void;
  onActionClick: (notification: AppNotification) => void;
  onClose: () => void;
  soundPack: SoundPackType;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
  onClearAll,
  onTriggerSimulate,
  onActionClick,
  onClose,
  soundPack,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [dndActive, setDndActive] = useState<boolean>(false);

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleTestNotificationSound = (type: 'standard' | 'urgent' | 'sonar' | 'radar') => {
    if (type === 'urgent') {
      soundFx.playAlertUrgent();
    } else if (type === 'radar') {
      soundFx.playNodeDiscovered();
    } else {
      soundFx.playNotification();
    }
  };

  const getNotificationIcon = (n: AppNotification) => {
    switch (n.type) {
      case 'mesh-node-discovered':
      case 'relay-hop':
        return <Radio className="w-4 h-4 text-emerald-400" />;
      case 'file-transfer':
        return <HardDrive className="w-4 h-4 text-amber-400" />;
      case 'e2ee-rekey':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'sos-broadcast':
        return <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />;
      case 'message':
      default:
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.max(0, Date.now() - timestamp);
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="max-w-2xl w-full bg-slate-900/80 backdrop-blur-2xl border border-white/15 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  MeshGuard Tactical Notification Hub
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold font-mono">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time RF Mesh Alerts, E2EE Rekey Logs & Priority Events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                  : 'bg-slate-800 text-slate-400 border-white/10'
              }`}
              title={soundEnabled ? 'Audio Alert On' : 'Alerts Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tactical Controls & Do-Not-Disturb Toolbar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDndActive(!dndActive);
                soundFx.playHapticTap();
              }}
              className={`px-2.5 py-1 rounded-xl font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                dndActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {dndActive ? <Moon className="w-3.5 h-3.5 text-rose-400" /> : <Sun className="w-3.5 h-3.5 text-slate-400" />}
              <span>{dndActive ? 'DND Active (Silent Mode)' : 'Standard Alerts'}</span>
            </button>

            <span className="text-slate-600">|</span>

            {/* Sound Pack Quick Tester */}
            <button
              onClick={() => handleTestNotificationSound('standard')}
              className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
              title={`Test ${soundPack} synthesizer sound`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Test Audio ({soundPack})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  onMarkAllAsRead();
                  soundFx.playCryptoVerify();
                }}
                className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  onClearAll();
                  soundFx.playCallEnd();
                }}
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 bg-slate-900/40 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'messages', label: 'Messages & Files' },
            { id: 'mesh-alerts', label: 'RF Mesh & Nodes' },
            { id: 'security', label: 'E2EE & Keys' },
            { id: 'sos', label: 'Urgent SOS' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                soundFx.playHapticTap();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-white/10 mx-auto flex items-center justify-center text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                No notifications in this category
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Trigger simulated mesh packets or peer discoveries below to test the pipeline.
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) onMarkAsRead(n.id);
                }}
                className={`p-3.5 rounded-2xl border transition-all relative flex items-start gap-3 group ${
                  n.read
                    ? 'bg-slate-950/30 border-white/5 text-slate-400'
                    : 'bg-slate-950/70 border-white/15 text-slate-200 shadow-md ring-1 ring-cyan-500/20'
                }`}
              >
                {/* Unread beacon dot */}
                {!n.read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}

                {/* Left Icon or Avatar */}
                <div className="p-2 rounded-xl bg-slate-900 border border-white/10 shrink-0 mt-0.5">
                  {n.avatar ? (
                    <img
                      src={n.avatar}
                      alt=""
                      className="w-5 h-5 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    getNotificationIcon(n)
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                      {n.category.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(n.timestamp)}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {n.description}
                  </p>

                  {/* Action Button if attached */}
                  {n.actionLabel && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onActionClick(n);
                        }}
                        className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <span>{n.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearNotification(n.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  title="Remove Notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Simulator Studio Bar for Testing */}
        <div className="p-3.5 bg-slate-950/80 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Real-time Hardware & Mesh Events</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onTriggerSimulate('mesh')}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-emerald-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mesh Peer Arrived</span>
            </button>

            <button
              onClick={() => onTriggerSimulate('file')}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>RAW File Received</span>
            </button>

            <button
              onClick={() => onTriggerSimulate('e2ee')}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-cyan-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>E2EE Rekey Step</span>
            </button>

            <button
              onClick={() => onTriggerSimulate('sos')}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-[11px] font-mono text-rose-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>SOS Mesh Alarm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
