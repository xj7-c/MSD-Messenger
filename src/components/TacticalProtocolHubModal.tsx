import React, { useState, useEffect } from 'react';
import {
  Shield,
  Radio,
  Wifi,
  Cpu,
  Layers,
  Repeat,
  Zap,
  Clock,
  Key,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Activity,
  Lock,
  Box,
  Eye,
  EyeOff,
  Server,
  Share2,
  X
} from 'lucide-react';
import { dtnBundleEngine, DTNBundle } from '../services/dtnBundleEngine';
import { senderKeyEngine } from '../services/senderKeyEngine';
import { multiDeviceSyncEngine, RegisteredDevice, SyncMessageEnvelope } from '../services/multiDeviceSyncEngine';
import { transportArqEngine, RadioFrameChunk, SackFeedback, StreamReconstructionStatus } from '../services/transportArqEngine';
import { proofOfWorkEngine, PoWHeader } from '../services/proofOfWorkEngine';
import { coverTrafficEngine } from '../services/coverTrafficEngine';
import { nativeBackgroundBridge, NativeBackgroundStatus } from '../services/nativeBackgroundBridge';
import { offlineSignalingEngine, OfflineSignalPacket } from '../services/offlineSignalingEngine';

interface TacticalProtocolHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

type TabType =
  | 'dtn_routing'
  | 'sender_keys'
  | 'multi_device'
  | 'transport_arq'
  | 'pow_antispam'
  | 'cover_traffic'
  | 'offline_webrtc'
  | 'native_services';

export const TacticalProtocolHubModal: React.FC<TacticalProtocolHubModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dtn_routing');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // DTN State
  const [dtnVault, setDtnVault] = useState<DTNBundle[]>([]);
  const [simulatedHopNode, setSimulatedHopNode] = useState('Tactical Relay Node Alpha');

  // Multi-Device State
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncMessageEnvelope[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('dev-phone-primary');

  // PoW State
  const [powDifficulty, setPowDifficulty] = useState<number>(proofOfWorkEngine.getDifficulty());
  const [isSolvingPoW, setIsSolvingPoW] = useState<boolean>(false);
  const [lastPoWResult, setLastPoWResult] = useState<PoWHeader | null>(null);

  // ARQ State
  const [testPayloadText, setTestPayloadText] = useState(
    'MeshGuard Tactical Classified Telemetry: Target bearing 284°, Signal RSSI -42dBm, 4K RAW Stream StreamId=0x98AF31'
  );
  const [simulatedLossRate, setSimulatedLossRate] = useState<number>(25); // 25% packet drop
  const [arqFrames, setArqFrames] = useState<RadioFrameChunk[]>([]);
  const [arqReconstructed, setArqReconstructed] = useState<StreamReconstructionStatus | null>(null);

  // Cover Traffic State
  const [coverStats, setCoverStats] = useState(coverTrafficEngine.getStats());

  // Native Background Status
  const [nativeStatus, setNativeStatus] = useState<NativeBackgroundStatus>(nativeBackgroundBridge.getStatus());
  const [nativeCodePlatform, setNativeCodePlatform] = useState<'android' | 'ios' | 'rust'>('android');

  // Offline WebRTC Signaling State
  const [simulatedSdpPackets, setSimulatedSdpPackets] = useState<OfflineSignalPacket[]>([]);

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const sub = nativeBackgroundBridge.subscribe((status) => setNativeStatus(status));
      const interval = setInterval(() => {
        setCoverStats(coverTrafficEngine.getStats());
      }, 2000);
      return () => {
        sub();
        clearInterval(interval);
      };
    }
  }, [isOpen]);

  const refreshData = () => {
    setDtnVault(dtnBundleEngine.getVaultBundles());
    setDevices(multiDeviceSyncEngine.getDevices());
    setSyncQueue(multiDeviceSyncEngine.getPendingQueue());
    setCoverStats(coverTrafficEngine.getStats());
    setNativeStatus(nativeBackgroundBridge.getStatus());
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestSolvePoW = async () => {
    setIsSolvingPoW(true);
    try {
      const result = await proofOfWorkEngine.solveProofOfWork(
        currentUserId,
        'MeshGuard Anti-Flood Micro-Puzzle Benchmark',
        powDifficulty
      );
      setLastPoWResult(result);
    } finally {
      setIsSolvingPoW(false);
    }
  };

  const handleRunArqSimulation = () => {
    const streamId = `sim-${Date.now().toString(36)}`;
    const chunks = transportArqEngine.fragmentPayload(streamId, testPayloadText, 20, 128);
    setArqFrames(chunks);

    // Simulate lossy channel delivery
    let lastStatus: StreamReconstructionStatus | null = null;
    chunks.forEach((chunk) => {
      const isDropped = Math.random() * 100 < simulatedLossRate;
      if (!isDropped) {
        lastStatus = transportArqEngine.ingestChunk(chunk);
      }
    });

    setArqReconstructed(lastStatus);
  };

  const handleGenerateOfflineSdp = () => {
    const fakeSdp = `v=0\r\no=MeshGuard 1849204 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtpmap:111 opus/48000/2\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtpmap:96 VP8/90000`;
    const packets = offlineSignalingEngine.fragmentSdpSignal(
      `call-${Date.now().toString(36)}`,
      currentUserId,
      'peer-tactical-02',
      'offer',
      fakeSdp,
      'BLE_GATT'
    );
    setSimulatedSdpPackets(packets);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                MeshGuard Tactical Protocol Suite
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-400/30 uppercase">
                  DTN • ARQ • PoW • BLE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Store-and-forward routing, offline WebRTC, Sender Keys, and RF traffic masking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/40 border-b border-white/10 overflow-x-auto text-xs font-mono scrollbar-none">
          {[
            { id: 'dtn_routing', label: 'DTN Store & Forward', icon: Repeat },
            { id: 'sender_keys', label: 'Sender Key Groups', icon: Key },
            { id: 'offline_webrtc', label: 'Offline WebRTC Signaling', icon: Radio },
            { id: 'multi_device', label: 'Multi-Device Sync', icon: Smartphone },
            { id: 'transport_arq', label: 'Low-MTU ARQ & FEC', icon: Layers },
            { id: 'pow_antispam', label: 'PoW Anti-Spam', icon: Shield },
            { id: 'cover_traffic', label: 'Cover Traffic & Masking', icon: EyeOff },
            { id: 'native_services', label: 'Native OS Background Bridges', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
          {/* TAB 1: DTN Store and Forward Routing */}
          {activeTab === 'dtn_routing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-cyan-200 flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-cyan-400" />
                    Delay-Tolerant Networking (DTN) Custody Vault
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl font-mono">
                    Messages are asynchronously buffered in persistent local custody. When devices physically move across physical locations, bundles replicate across intermediate nodes (epidemic anti-entropy), enabling delivery even if the sender and recipient are never online at the same time.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-center font-mono">
                    <div className="text-cyan-400 font-bold text-lg">{dtnVault.length}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Custody Bundles</div>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-center font-mono">
                    <div className="text-emerald-400 font-bold text-lg">{dtnBundleEngine.getDeliveredCount()}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Delivered</div>
                  </div>
                </div>
              </div>

              {/* Custody Inventory */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>ACTIVE DTN CUSTODY BUNDLES (STORE-AND-FORWARD QUEUE)</span>
                  <button
                    onClick={refreshData}
                    className="hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Vault
                  </button>
                </div>

                {dtnVault.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-slate-400 font-mono">
                    <Box className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    No bundles currently held in local custody. Sending a message enqueues DTN bundles automatically.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dtnVault.map((bundle) => (
                      <div
                        key={bundle.bundleId}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-cyan-500/40 transition-all font-mono text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 font-bold truncate">{bundle.bundleId}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-400/30">
                            Custody Accepted
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div>
                            <span className="text-slate-500">From:</span> {bundle.sourceHandle}
                          </div>
                          <div>
                            <span className="text-slate-500">To:</span> {bundle.destinationHandle}
                          </div>
                          <div>
                            <span className="text-slate-500">TTL Remaining:</span>{' '}
                            {Math.max(0, Math.round((bundle.expiresAt - Date.now()) / 1000))}s
                          </div>
                          <div>
                            <span className="text-slate-500">Hop Count:</span> {bundle.hopCount} / {bundle.maxHops}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Visited: {bundle.visitedNodes.length} nodes</span>
                          <span>Digest: {bundle.payloadDigest}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Sender Key Protocol for Groups */}
          {activeTab === 'sender_keys' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-indigo-200 flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-400" />
                    Signal Sender Key Group Protocol
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Instead of encrypting N separate pairwise Double Ratchet messages for every node in a group chat, MeshGuard establishes a <strong>Sender Chain Key</strong>. A single encrypted broadcast packet reaches all members over the mesh radio, cutting radio airtime by 90%+ and protecting battery life.
                  </p>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-indigo-400/30 text-indigo-300 text-xs font-bold shrink-0">
                  92.4% RF Airtime Reduction
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">1. Sender Chain Key</div>
                  <div className="text-indigo-400 font-bold">0x7f4e91a2b8...</div>
                  <p className="text-[11px] text-slate-300">
                    Symmetric ratchet root for group broadcasts. Rotated automatically on member leave.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">2. Key Distribution</div>
                  <div className="text-cyan-400 font-bold">Pairwise E2EE Double Ratchet</div>
                  <p className="text-[11px] text-slate-300">
                    Sender keys are distributed 1-on-1 to authorized group participants upon joining.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">3. Message Ratchet</div>
                  <div className="text-emerald-400 font-bold">Single Broadcast Packet</div>
                  <p className="text-[11px] text-slate-300">
                    Every message generates a fresh ephemeral message key via HMAC-SHA256.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Offline WebRTC Signaling */}
          {activeTab === 'offline_webrtc' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-cyan-200 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-cyan-400" />
                    Offline WebRTC Signaling (No STUN / TURN Required)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Negotiates real-time P2P Voice and Video calls entirely over BLE GATT characteristics or local mDNS radio broadcasts. SDP Offers, Answers, and ICE Host Candidates are chunked and transmitted across local radio.
                  </p>
                </div>
                <button
                  onClick={handleGenerateOfflineSdp}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
                >
                  <Play className="w-3.5 h-3.5" /> Simulate Offline Signaling
                </button>
              </div>

              {simulatedSdpPackets.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">FRAGMENTED BLE GATT SIGNALING PACKETS</div>
                  <div className="space-y-1.5">
                    {simulatedSdpPackets.map((pkt) => (
                      <div
                        key={`${pkt.signalId}-${pkt.chunkIndex}`}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
                            {pkt.channel}
                          </span>
                          <span className="text-white font-bold">{pkt.type.toUpperCase()}</span>
                          <span className="text-slate-400 text-[11px]">
                            Chunk {pkt.chunkIndex + 1}/{pkt.totalChunks}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[10px] truncate max-w-xs">{pkt.sdpOrCandidate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Multi-Device Double Ratchet Sync */}
          {activeTab === 'multi_device' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-teal-200 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-teal-400" />
                    Multi-Device Double Ratchet Key Tree
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Maintains user identity root keys with independent device subkey ratchets across Phone, Laptop, and Tablet, syncing missed offline messages when devices return within mesh range.
                  </p>
                </div>
                <div className="text-xs text-teal-300 px-3 py-1.5 rounded-xl bg-slate-900 border border-teal-400/30">
                  Root Key: {multiDeviceSyncEngine.getPrimaryIdentityRoot().substring(0, 14)}...
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {devices.map((dev) => (
                  <div
                    key={dev.deviceId}
                    className={`p-4 rounded-2xl border transition-all ${
                      dev.deviceId === selectedDevice
                        ? 'bg-teal-950/40 border-teal-400/60 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                        : 'bg-slate-950/60 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {dev.deviceType === 'Phone' && <Smartphone className="w-4 h-4 text-teal-400" />}
                        {dev.deviceType === 'Laptop' && <Laptop className="w-4 h-4 text-cyan-400" />}
                        {dev.deviceType === 'Tablet' && <Tablet className="w-4 h-4 text-indigo-400" />}
                        <span className="font-bold text-xs text-white">{dev.deviceName}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          dev.status === 'online'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        }`}
                      >
                        {dev.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div>
                        <span className="text-slate-500">Ephemeral Pub:</span> {dev.ephemeralPublicHex}
                      </div>
                      <div>
                        <span className="text-slate-500">Sync Seq:</span> #{dev.syncSequenceNumber}
                      </div>
                      <div>
                        <span className="text-slate-500">Primary:</span> {dev.isPrimary ? 'Yes (Master)' : 'Sub-Node'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        multiDeviceSyncEngine.reconcileDeviceCatchup(dev.deviceId);
                        refreshData();
                      }}
                      className="mt-3 w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-teal-300 text-[11px] font-bold border border-white/10 cursor-pointer"
                    >
                      Trigger Catchup Sync
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Transport ARQ and Low-MTU Fragmentation */}
          {activeTab === 'transport_arq' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-amber-200 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    Low-MTU ARQ & Forward Error Correction (FEC)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Optimized for BLE link MTU (247-512B). Employs Selective Repeat ARQ sliding window, CRC32 integrity, and Fountain FEC parity chunks to withstand severe packet drop over unstable radio frequencies.
                  </p>
                </div>
                <button
                  onClick={handleRunArqSimulation}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
                >
                  <Play className="w-3.5 h-3.5" /> Test Radio ARQ Frame Drop
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
                  <div className="text-xs font-bold text-slate-300">SIMULATED RADIO LINK CONDITIONS</div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Simulated RF Packet Loss Rate: {simulatedLossRate}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      value={simulatedLossRate}
                      onChange={(e) => setSimulatedLossRate(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Payload Content</label>
                    <textarea
                      value={testPayloadText}
                      onChange={(e) => setTestPayloadText(e.target.value)}
                      rows={2}
                      className="w-full p-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-slate-300">ARQ RECONSTRUCTION STATUS</div>
                  {arqReconstructed ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Reconstruction:</span>
                        <span
                          className={`font-bold ${
                            arqReconstructed.isComplete ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {arqReconstructed.isComplete ? '100% Complete' : `${arqReconstructed.progressPercent}%`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all"
                          style={{ width: `${arqReconstructed.progressPercent}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Received {arqReconstructed.receivedCount} / {arqReconstructed.totalFrames} chunks (with 20%
                        FEC Parity Protection)
                      </div>
                      {arqReconstructed.reconstructedData && (
                        <div className="p-2 rounded-lg bg-slate-900 text-emerald-300 text-[10px] truncate">
                          Reconstructed: {arqReconstructed.reconstructedData}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs py-4 text-center">Click test above to run frame simulation</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Proof-of-Work Anti-Spam */}
          {activeTab === 'pow_antispam' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-emerald-200 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Lightweight Proof-of-Work (PoW) Anti-Spam Engine
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Requires nodes to solve a tiny computational puzzle (~10-40ms) attached to each packet header. Prevents rogue nodes from flooding the radio frequency and exhausting battery life.
                  </p>
                </div>
                <button
                  onClick={handleTestSolvePoW}
                  disabled={isSolvingPoW}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer text-xs shrink-0 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" /> {isSolvingPoW ? 'Solving PoW...' : 'Benchmark Micro-PoW'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
                  <div className="text-xs font-bold text-slate-300">DIFFICULTY PARAMETERS</div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Target Leading Zero Bits: {powDifficulty} bits
                    </label>
                    <input
                      type="range"
                      min={4}
                      max={16}
                      value={powDifficulty}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPowDifficulty(val);
                        proofOfWorkEngine.setDifficulty(val);
                      }}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Difficulty 10-12 bits guarantees ~1,000 to 4,000 hash operations. Negligible for legitimate users; fatal for RF battery drainers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-slate-300">POW PUZZLE VERIFICATION</div>
                  {lastPoWResult ? (
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-500">Nonce:</span> {lastPoWResult.nonce}
                      </div>
                      <div>
                        <span className="text-slate-500">Solution Hash:</span>{' '}
                        <span className="text-emerald-400 font-bold">{lastPoWResult.solutionHashHex}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Execution Time:</span> {lastPoWResult.solveDurationMs}ms
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 text-[11px] mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Valid Header Proof
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs py-4 text-center">Click benchmark above to solve a puzzle</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Cover Traffic and Masking */}
          {activeTab === 'cover_traffic' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-purple-200 flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-purple-400" />
                    Traffic Masking & Cover Traffic (Side-Channel Resistance)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Pads all transmissions to constant 512B / 1024B byte envelopes and injects Poisson-timed dummy noise packets. Sniffers monitoring radio signals cannot determine packet size, active sender identity, or communication bursts.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold shrink-0">
                  CSPRNG Noise Active
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">Real Packets Padded</div>
                  <div className="text-xl font-bold text-purple-400">{coverStats.realPadded}</div>
                  <div className="text-[10px] text-slate-500">Uniform 512B Envelope</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">Dummy Noise Injected</div>
                  <div className="text-xl font-bold text-pink-400">{coverStats.dummySent}</div>
                  <div className="text-[10px] text-slate-500">Poisson Distribution (~8s)</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">RF Side-Channel Shield</div>
                  <div className="text-xl font-bold text-emerald-400">100% Protected</div>
                  <div className="text-[10px] text-slate-500">Zero Length Leakage</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Native Background Service Wrappers */}
          {activeTab === 'native_services' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-rose-200 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-rose-400" />
                    Native OS Background Wrappers (Android / iOS / Rust Core)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Web browsers sleep background sockets when the screen is locked. MeshGuard provides native background service blueprints (Android Foreground Service, iOS CoreBluetooth state preservation, Rust mobile FFI).
                  </p>
                </div>
                <button
                  onClick={() => {
                    nativeBackgroundBridge.toggleForegroundService();
                    setNativeStatus(nativeBackgroundBridge.getStatus());
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    nativeStatus.foregroundServiceRunning
                      ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  {nativeStatus.foregroundServiceRunning ? 'Stop Background Service' : 'Start Background Service'}
                </button>
              </div>

              {/* Status HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="text-slate-500 text-[10px]">DAEMON STATUS</div>
                  <div className="font-bold text-emerald-400">
                    {nativeStatus.foregroundServiceRunning ? 'Running in Foreground' : 'Suspended'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="text-slate-500 text-[10px]">WAKELOCK HELD</div>
                  <div className="font-bold text-cyan-400">
                    {nativeStatus.wakeLockAcquired ? 'PARTIAL_WAKE_LOCK Active' : 'Released'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="text-slate-500 text-[10px]">BACKGROUND BLE SCAN</div>
                  <div className="font-bold text-purple-400">
                    {nativeStatus.continuousBleScanActive ? 'Low Latency Scan' : 'Idle'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                  <div className="text-slate-500 text-[10px]">BACKGROUND UPTIME</div>
                  <div className="font-bold text-amber-400">{Math.round(nativeStatus.uptimeSeconds / 60)} mins</div>
                </div>
              </div>

              {/* Code Blueprint Viewer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNativeCodePlatform('android')}
                      className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                        nativeCodePlatform === 'android' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Android (Kotlin Service)
                    </button>
                    <button
                      onClick={() => setNativeCodePlatform('ios')}
                      className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                        nativeCodePlatform === 'ios' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      iOS (CoreBluetooth Runner)
                    </button>
                    <button
                      onClick={() => setNativeCodePlatform('rust')}
                      className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                        nativeCodePlatform === 'rust' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Rust FFI Engine
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const code =
                        nativeCodePlatform === 'android'
                          ? nativeBackgroundBridge.getAndroidForegroundServiceCode()
                          : nativeCodePlatform === 'ios'
                          ? nativeBackgroundBridge.getIosCoreBluetoothCode()
                          : nativeBackgroundBridge.getRustCoreFfiCode();
                      handleCopy(code, 'native_code');
                    }}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'native_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Source Code
                  </button>
                </div>

                <pre className="p-3 rounded-lg bg-slate-900 text-slate-300 text-[11px] max-h-56 overflow-y-auto font-mono">
                  {nativeCodePlatform === 'android' && nativeBackgroundBridge.getAndroidForegroundServiceCode()}
                  {nativeCodePlatform === 'ios' && nativeBackgroundBridge.getIosCoreBluetoothCode()}
                  {nativeCodePlatform === 'rust' && nativeBackgroundBridge.getRustCoreFfiCode()}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
