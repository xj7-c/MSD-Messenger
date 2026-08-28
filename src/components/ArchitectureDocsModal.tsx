import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Radio, 
  ShieldCheck, 
  HardDrive, 
  Sliders, 
  X, 
  Zap, 
  Lock, 
  Wifi, 
  WifiOff, 
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ArchitectureDocsModalProps {
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<'uiux' | 'features' | 'architecture' | 'multiplatform'>('multiplatform');

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-neutral-100">
                  System Architecture & Technical Specifications
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono font-semibold shadow-sm">
                  Maded by xj7
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono hidden sm:inline">
                  Production Whitepaper
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                MeshGuard Zero-Knowledge Dual-Mode E2EE Protocol Suite • Designed & Maded by xj7
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

        {/* Deliverables Tabs */}
        <div className="flex items-center gap-1 p-2 bg-neutral-950 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveSection('multiplatform')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeSection === 'multiplatform'
                ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ⭐ iOS / Android / Windows Specs
          </button>

          <button
            onClick={() => setActiveSection('uiux')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeSection === 'uiux'
                ? 'bg-neutral-800 text-cyan-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1. UI/UX Concept
          </button>

          <button
            onClick={() => setActiveSection('features')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeSection === 'features'
                ? 'bg-neutral-800 text-purple-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            2. Themes & Emojis
          </button>

          <button
            onClick={() => setActiveSection('architecture')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeSection === 'architecture'
                ? 'bg-neutral-800 text-emerald-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            3. E2EE Protocol
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin text-xs text-neutral-300 leading-relaxed font-sans">
          {/* SECTION 0: MULTI-PLATFORM iOS, Android, Windows Architecture */}
          {activeSection === 'multiplatform' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cross-Platform Hardware-Bound Persistence & Custom Emoji Pipeline</span>
                </h4>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Production-grade technical implementation covering native hardware security (Apple Keychain, Android Keystore, Windows DPAPI), Zero-Knowledge restoration, WebP/GIF compression, and custom emoji shortcode AST parsers across iOS, Android, and Windows.
                </p>
              </div>

              {/* Hardware Security Matrix */}
              <div className="space-y-2">
                <h5 className="font-bold text-neutral-200 text-xs font-mono uppercase text-cyan-400">
                  Feature 1: Platform Hardware Security Architecture
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono font-bold">
                      iOS (Swift / Keychain)
                    </span>
                    <p className="text-[11px] text-neutral-300">
                      Stores 256-bit device token in Apple Keychain using <code className="text-cyan-300">kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly</code>, salted with <code className="text-cyan-300">identifierForVendor</code>. Survives full app uninstall/reinstall.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold">
                      Android (Kotlin / Keystore)
                    </span>
                    <p className="text-[11px] text-neutral-300">
                      Master AES-256-GCM key inside Android Keystore backed by hardware Secure Element/TEE. Persists UUID in <code className="text-emerald-300">EncryptedSharedPreferences</code> backed by Google Play Backup exclusion.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-mono font-bold">
                      Windows Desktop (.NET / DPAPI)
                    </span>
                    <p className="text-[11px] text-neutral-300">
                      Utilizes Windows Credential Locker / <code className="text-purple-300">DataProtectionProvider</code> with Machine Scope, hashing hardware SMBIOS UUID and CPU ID to persist across re-installs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Emoji & Sticker Engine */}
              <div className="space-y-2">
                <h5 className="font-bold text-neutral-200 text-xs font-mono uppercase text-amber-400">
                  Feature 2: Custom Emojis & Dynamic Stickers Pipeline
                </h5>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <strong className="text-neutral-200 block">Shortcode & Tag Parser Regex</strong>
                      <code className="text-amber-300 font-mono text-[10px] block break-all">
                        {"/<a?:([a-zA-Z0-9_]{2,32}):([0-9a-fA-F-]{36})>|:([a-zA-Z0-9_]{2,32}):/g"}
                      </code>
                      <p className="text-neutral-400 text-[10px]">
                        Single-pass AST tokenizer with O(1) in-memory shortcode resolution table.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <strong className="text-neutral-200 block">Sharp / WebP Media Processing</strong>
                      <p className="text-neutral-400 text-[10px]">
                        Auto-converts uploaded PNG/JPEG/APNG into lossless 128x128 Animated WebP (emojis) and 512x512 APNG/Lottie (stickers) with strict dimension sanitization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: UI/UX CONCEPT */}
          {activeSection === 'uiux' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  <span>Offline Uncompressed File Transfer User Flow</span>
                </h4>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Traditional chat apps aggressively transcode, downscale, and compress 4K videos, DNG photos, and binary archives. MeshGuard executes a pure bit-for-bit uncompressed pipeline using local Wi-Fi Direct backhauls.
                </p>
              </div>

              {/* Step by step flow */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h5 className="font-bold text-neutral-100 text-xs">RF Beacon Discovery</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    Devices scan 2.4/5GHz RF spectrum via BLE 5.4. Nearby peers are discovered within ~100m radius and placed on the Mesh Radar.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h5 className="font-bold text-neutral-100 text-xs">Wi-Fi Direct Handshake</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    Sender and receiver initiate an autonomous high-throughput Wi-Fi Direct P2P tunnel (~480–650 Mbps) with zero router or internet connection.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h5 className="font-bold text-neutral-100 text-xs">Chunking & E2EE Stream</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    The raw file is split into binary chunks (64KB–1MB). Each chunk is encrypted with an ephemeral ratcheted session key (AES-256-GCM).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">
                    4
                  </div>
                  <h5 className="font-bold text-neutral-100 text-xs">SHA-256 Bit Verification</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    Receiver reassembles chunks and runs a hardware-accelerated SHA-256 checksum against sender's signed manifest to guarantee zero quality loss.
                  </p>
                </div>
              </div>

              {/* Layout Blueprint */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h5 className="font-bold text-neutral-200 text-xs font-mono uppercase">
                  Adaptive Screen Architecture
                </h5>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-400">
                  <li><strong>Header Status Indicator:</strong> Real-time RF signal bars (dBm), active mesh hops count, and instantaneous protocol badge (Wi-Fi Direct / BLE / Internet).</li>
                  <li><strong>Sidebar Radar Bar:</strong> Real-time counter of discovered offline nodes with 1-click radar modal access.</li>
                  <li><strong>Interactive Chat Canvas:</strong> Distinct message bubble stylings with embedded uncompressed media preview cards, E2EE verification badges, and raw ciphertext inspector.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 2: THEMES & GLOBAL EMOJIS */}
          {activeSection === 'features' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <span>Custom Themes, Message Bubbles & Universal Emojis</span>
                </h4>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  MeshGuard provides full personalization across every UI layer, allowing users to customize aesthetics, audio acoustics, and expressive emoji packs seamlessly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Themes and Styling */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <h5 className="font-bold text-neutral-100 text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Theming Architecture</span>
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-neutral-400">
                    <li><strong>Midnight Tactical:</strong> High-contrast dark neutral palette designed for maximum legibility in low-light environments.</li>
                    <li><strong>OLED Pure Black (Stealth):</strong> 100% #000000 true black background with Emerald accents, optimized for zero battery draw on OLED panels.</li>
                    <li><strong>Cyber Neon:</strong> High-saturation violet/cyan glowing accents with glassmorphic backdrop blur layers.</li>
                    <li><strong>Solar Amber & Paper Light:</strong> Warm daylight palettes for high-glare field operations.</li>
                    <li><strong>Bubble Geometries:</strong> Rounded Smooth, Cyber Angular (chamfered tech borders), Minimal Wireframe, and Glassmorphic.</li>
                  </ul>
                </div>

                {/* Emojis & Synthesizer */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <h5 className="font-bold text-neutral-100 text-xs font-mono text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Universal Emojis & Synthesizer</span>
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-neutral-400">
                    <li><strong>Shortcode Parsing:</strong> Native translation of codes like <code>:mesh_radar:</code>, <code>:cyber_shield:</code>, <code>:prores_raw:</code> into animated SVGs.</li>
                    <li><strong>Mesh Studio:</strong> Users can publish and share custom emoji packs across local mesh clusters with zero central server approval.</li>
                    <li><strong>Web Audio Synthesizer:</strong> Zero-dependency pure mathematical waveform generator for sent chirps, received chimes, mesh hop pings, and key ratchets.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: MESH & E2EE ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Dual-Mode Mesh Balancing & Zero-Knowledge E2EE</span>
                </h4>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  How MeshGuard seamlessly negotiates between Bluetooth Low Energy mesh relays, high-bandwidth Wi-Fi Direct, and Internet Cloud fallback without ever compromising end-to-end encryption.
                </p>
              </div>

              {/* Protocol Stack Breakdown */}
              <div className="space-y-3">
                <h5 className="font-bold text-neutral-200 text-xs font-mono uppercase">
                  Multi-Tier Protocol Stack
                </h5>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
                    <span className="p-1 rounded bg-cyan-950 text-cyan-400 text-[10px] font-bold shrink-0">
                      Tier 1: BLE Mesh
                    </span>
                    <p className="text-neutral-400 font-sans">
                      Low-power advertisement packets for peer discovery, presence heartbeat beacons, and multihop store-and-forward text message routing when out of Wi-Fi range (TTL up to 7 hops).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
                    <span className="p-1 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold shrink-0">
                      Tier 2: Wi-Fi Direct
                    </span>
                    <p className="text-neutral-400 font-sans">
                      High-bandwidth (480–650 Mbps) direct peer-to-peer 5GHz link for 4K video calling, 48kHz Opus voice calling, and gigabyte-scale uncompressed file transfers.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
                    <span className="p-1 rounded bg-indigo-950 text-indigo-400 text-[10px] font-bold shrink-0">
                      Tier 3: Cloud Relay
                    </span>
                    <p className="text-neutral-400 font-sans">
                      Used when peers are not in physical proximity. The cloud relay is strictly zero-knowledge: it only moves opaque ciphertexts and possesses no cryptographic keys.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cryptographic Guarantees */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h5 className="font-bold text-neutral-200 text-xs font-mono uppercase text-cyan-400">
                  Cryptographic Guarantees (Signal Double Ratchet)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-400">
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <strong className="text-neutral-200 block mb-0.5">Forward Secrecy</strong>
                    Compromising a current key cannot decrypt messages sent in the past.
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <strong className="text-neutral-200 block mb-0.5">Break-in Recovery</strong>
                    A compromised key heals itself on the very next ephemeral Diffie-Hellman ratchet exchange.
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <strong className="text-neutral-200 block mb-0.5">Authenticated Payloads</strong>
                    AES-256-GCM with 128-bit authentication tags prevents packet tampering or bit-flipping on mesh hops.
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <strong className="text-neutral-200 block mb-0.5">Zero-Knowledge Key Storage</strong>
                    Private keys are generated locally via Web Crypto API and never transmitted across the network.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Architecture Validated & Operational</span>
            </span>
            <span className="text-xs font-mono text-cyan-400/90 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              Maded by xj7
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
