import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Radio, 
  WifiOff, 
  ShieldCheck, 
  Check, 
  X, 
  Apple, 
  Chrome, 
  Zap, 
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface InstallAppModalProps {
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'desktop' | 'ios'>('android');
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        soundFx.playCryptoVerify();
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers where beforeinstallprompt already fired or is manual
      alert('To install MeshGuard: Click the install icon (⊕ or 💻) in your browser address bar or use browser menu > "Install MeshGuard".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="max-w-xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-neutral-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800/80 shadow-lg shadow-cyan-950/50">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-100 flex items-center gap-2">
                <span>Install MeshGuard Standalone App</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  Offline Ready
                </span>
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Run without Wi-Fi or Internet using native Bluetooth LE mesh networking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin">
          {/* Main 1-Click Install Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-cyan-200 flex items-center justify-center sm:justify-start gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>1-Click Native App Installation</span>
              </h4>
              <p className="text-xs text-neutral-300">
                Installs MeshGuard directly to your home screen or desktop application dock.
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 cursor-pointer shrink-0 transition-all active:scale-95"
            >
              {installSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Installed Successfully!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Install App Now</span>
                </>
              )}
            </button>
          </div>

          {/* Offline Mesh Benefits Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <WifiOff className="w-3.5 h-3.5" />
                <span>100% Offline</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans leading-tight">
                Works in airplane mode, outdoors, or during cellular outages.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Radio className="w-3.5 h-3.5" />
                <span>Bluetooth LE</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans leading-tight">
                Autonomous node hopping relays encrypted messages peer-to-peer.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Local Storage</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans leading-tight">
                All messages and custom emojis are saved securely on your device.
              </p>
            </div>
          </div>

          {/* Platform specific tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-1 border-b border-neutral-800 pb-2">
              <button
                onClick={() => setActiveTab('android')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Android / Chrome</span>
              </button>

              <button
                onClick={() => setActiveTab('desktop')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>Windows / Mac / Linux</span>
              </button>

              <button
                onClick={() => setActiveTab('ios')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Apple className="w-3.5 h-3.5 text-neutral-200" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            {/* Tab contents */}
            {activeTab === 'android' && (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2 text-neutral-300">
                <div className="font-bold text-neutral-100">Installation on Android:</div>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed">
                  <li>Tap the browser three dots <strong className="text-neutral-200">⋮</strong> menu at the top right.</li>
                  <li>Select <strong className="text-cyan-300">"Install app"</strong> or <strong className="text-cyan-300">"Add to Home screen"</strong>.</li>
                  <li>MeshGuard will be added as a native app icon. Launch it anytime with or without Wi-Fi!</li>
                </ol>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2 text-neutral-300">
                <div className="font-bold text-neutral-100">Installation on Desktop:</div>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed">
                  <li>Look at the right side of the address bar for the <strong className="text-cyan-300">Install icon (💻 or ⊕)</strong>.</li>
                  <li>Click <strong className="text-cyan-300">"Install"</strong> to add MeshGuard as a standalone desktop window.</li>
                  <li>It runs in its own window with zero browser tabs and full offline cache!</li>
                </ol>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2 text-neutral-300">
                <div className="font-bold text-neutral-100">Installation on iPhone / iPad (Safari):</div>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed">
                  <li>Tap the <strong className="text-neutral-200">Share button</strong> (square with arrow pointing up) at the bottom.</li>
                  <li>Scroll down and tap <strong className="text-cyan-300">"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong className="text-cyan-300">"Add"</strong> in the top right. MeshGuard is now on your home screen!</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="text-[11px] text-neutral-500 font-mono">
            Zero-Knowledge • Standalone Progressive Application
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
