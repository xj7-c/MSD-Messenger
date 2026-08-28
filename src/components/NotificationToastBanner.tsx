import React, { useEffect } from 'react';
import { 
  Bell, 
  X, 
  Radio, 
  ShieldCheck, 
  HardDrive, 
  AlertTriangle, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastBannerProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onActionClick: (notification: AppNotification) => void;
}

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({
  notification,
  onDismiss,
  onActionClick,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
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

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-250 select-none">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-start gap-3 relative overflow-hidden group">
        {/* Progress timer line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 opacity-60 animate-[width_5s_linear]" />

        {/* Icon / Avatar */}
        <div className="p-2 rounded-xl bg-slate-950/80 border border-white/10 shrink-0">
          {notification.avatar ? (
            <img
              src={notification.avatar}
              alt=""
              className="w-5 h-5 rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            getIcon()
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              {notification.category.replace('-', ' ')}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">• Just now</span>
          </div>
          <h4 className="text-xs font-bold text-white truncate">
            {notification.title}
          </h4>
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mt-0.5">
            {notification.description}
          </p>

          {notification.actionLabel && (
            <button
              onClick={() => onActionClick(notification)}
              className="mt-2 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold group-hover:underline cursor-pointer"
            >
              <span>{notification.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
