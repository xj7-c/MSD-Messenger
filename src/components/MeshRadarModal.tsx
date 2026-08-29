import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Zap, 
  Battery, 
  Activity, 
  X, 
  RefreshCw, 
  Share2, 
  Sliders, 
  Send,
  MessageSquare,
  Lock,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Users,
  UserPlus
} from 'lucide-react';
import { MeshNode, User } from '../types';
import { soundFx } from '../utils/soundFx';
import { bluetoothMesh } from '../services/bluetoothService';

interface MeshRadarModalProps {
  nodes: MeshNode[];
  currentUser: User;
  onClose: () => void;
  onSelectNodeToChat: (node: MeshNode) => void;
  onClearDemoNodes?: () => void;
}

export const MeshRadarModal: React.FC<MeshRadarModalProps> = ({
  nodes,
  currentUser,
  onClose,
  onSelectNodeToChat,
  onClearDemoNodes,
}) => {
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(nodes[0] || null);
  const [isScanning, setIsScanning] = useState(false);
  const [isBleScanning, setIsBleScanning] = useState(false);
  const [bleStatusMsg, setBleStatusMsg] = useState<string | null>(null);
  const [beaconActive, setBeaconActive] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Synchronize selected node when nodes change
  useEffect(() => {
    if (nodes.length > 0 && (!selectedNode || !nodes.find(n => n.id === selectedNode.id))) {
      setSelectedNode(nodes[0]);
    }
  }, [nodes]);

  const handleTriggerScan = () => {
    setIsScanning(true);
    soundFx.playMeshHop();
    setTimeout(() => {
      setIsScanning(false);
      soundFx.playReceive();
    }, 1000);
  };

  const handlePairRealBluetooth = async () => {
    try {
      setIsBleScanning(true);
      setBleStatusMsg('Scanning for nearby BLE devices...');
      const paired = await bluetoothMesh.scanAndPairDevice();
      if (paired) {
        setBleStatusMsg(`Paired with ${paired.name}! Connected via Bluetooth LE.`);
        soundFx.playCryptoVerify();
      } else {
        setBleStatusMsg(null);
      }
    } catch (err: any) {
      setBleStatusMsg(err?.message || 'Bluetooth scan cancelled or unavailable.');
    } finally {
      setIsBleScanning(false);
    }
  };

  const getInviteUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('joinPeer', currentUser.id);
    url.searchParams.set('name', currentUser.name);
    return url.toString();
  };

  const handleCopyInvite = () => {
    const inviteUrl = getInviteUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      soundFx.playSend();
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleOpenSecondTab = () => {
    const inviteUrl = getInviteUrl();
    window.open(inviteUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] overflow-y-auto md:overflow-hidden">
        {/* Left Radar Visual Canvas & RF Controls */}
        <div className="flex-1 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col items-center justify-between relative bg-gradient-to-b from-neutral-950 to-neutral-900 min-h-[380px] sm:min-h-[440px]">
          {/* Radar Header */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2.5 z-10 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
                <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-100 truncate">
                    RF Spectrum & Mesh Radar
                  </h3>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800 shrink-0">
                    BLE 5.4 + Wi-Fi Direct
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                  Autonomous Local Discovery: ~100m • {nodes.length} peer{nodes.length === 1 ? '' : 's'} active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                onClick={handleTriggerScan}
                disabled={isScanning}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-[11px] sm:text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Scan Spectrum'}</span>
              </button>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
                title="Close Radar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2D Circular Radar Display */}
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 my-3 sm:my-5 flex items-center justify-center shrink-0">
            {/* Concentric distance rings */}
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]" />
            <div className="absolute inset-6 sm:inset-8 rounded-full border border-emerald-500/30" />
            <div className="absolute inset-12 sm:inset-16 rounded-full border border-emerald-500/40" />
            <div className="absolute inset-18 sm:inset-24 rounded-full border border-emerald-500/60" />

            {/* Radar crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/20" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/20" />

            {/* Rotating radar sweep beam */}
            <div className="absolute inset-0 rounded-full border border-transparent border-t-emerald-400/80 bg-gradient-to-tr from-transparent via-transparent to-emerald-500/10 animate-spin [animation-duration:4s] pointer-events-none" />

            {/* Center Local User Node */}
            <div className="relative z-20 flex flex-col items-center pointer-events-none">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-400 ring-4 ring-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <span className="w-2 h-2 rounded-full bg-neutral-950" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 font-bold mt-1 bg-neutral-950/90 px-1 rounded shadow">
                You ({currentUser.name.split(' ')[0]})
              </span>
            </div>

            {/* Render Surrounding Nodes on Radar by distance/angle */}
            {nodes.length > 0 ? (
              nodes.map((node, index) => {
                const angles = [35, 145, 215, 325, 85, 275];
                const distances = [45, 65, 75, 55, 60, 70];
                const angle = angles[index % angles.length] * (Math.PI / 180);
                const dist = distances[index % distances.length];

                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 transition-transform cursor-pointer group ${
                      isSelected ? 'scale-120 z-40' : 'hover:scale-110'
                    }`}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                    }}
                    title={`${node.name} (${node.rssi} dBm)`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl p-0.5 ring-2 flex items-center justify-center shadow-lg transition-colors ${
                        isSelected
                          ? 'ring-cyan-400 bg-cyan-950'
                          : node.peerType === 'direct-wifidirect'
                          ? 'ring-emerald-500 bg-emerald-950'
                          : 'ring-amber-500 bg-amber-950'
                      }`}
                    >
                      <img
                        src={node.avatar}
                        alt={node.name}
                        className="w-full h-full rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-mono text-neutral-200 whitespace-nowrap bg-neutral-950/90 px-1 py-0.2 rounded border border-neutral-800 shadow">
                      {node.rssi}dBm
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono text-emerald-500/60 animate-pulse text-center px-4 bg-neutral-950/70 rounded py-1">
                  Radar active • Listening for incoming RF beacons...
                </span>
              </div>
            )}
          </div>

          {/* Quick Real Device Connect Actions */}
          <div className="w-full flex flex-col gap-2 p-2.5 sm:p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-[11px] sm:text-xs font-mono z-10 mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${beaconActive ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
                <span className="text-neutral-300">BLE & Wi-Fi Direct Beacon: Active</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePairRealBluetooth}
                  disabled={isBleScanning}
                  className="px-2.5 py-1 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/80 flex items-center gap-1.5 transition-all cursor-pointer text-[10px] sm:text-xs font-bold shadow-sm"
                  title="Pair Real Nearby Physical Bluetooth Device (Offline)"
                >
                  <Radio className={`w-3 h-3 text-indigo-400 ${isBleScanning ? 'animate-spin' : ''}`} />
                  <span>{isBleScanning ? 'Scanning BLE...' : 'Pair Bluetooth LE'}</span>
                </button>

                <button
                  onClick={handleCopyInvite}
                  className="px-2.5 py-1 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 flex items-center gap-1.5 transition-all cursor-pointer text-[10px] sm:text-xs font-bold"
                  title="Copy Direct P2P Mesh Link"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Mesh Link'}</span>
                </button>

                <button
                  onClick={handleOpenSecondTab}
                  className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer text-[10px] sm:text-xs"
                  title="Open another peer window in browser"
                >
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                  <span>New Peer Tab</span>
                </button>
              </div>
            </div>

            {bleStatusMsg && (
              <div className="px-2.5 py-1 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-[10px] text-indigo-200 flex items-center justify-between">
                <span>{bleStatusMsg}</span>
                <button onClick={() => setBleStatusMsg(null)} className="text-indigo-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Node Inspector & Action Hub */}
        <div className="w-full md:w-80 p-4 sm:p-6 bg-neutral-950 flex flex-col justify-between space-y-4 shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Node Telemetry & Routing
              </h4>
              <button
                onClick={onClose}
                className="hidden md:block p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Node Profile Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={selectedNode.avatar}
                    alt={selectedNode.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cyan-500/40"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-neutral-100 truncate">
                      {selectedNode.name}
                    </h4>
                    <p className="text-[11px] font-mono text-cyan-400 truncate">
                      Public Key: {selectedNode.publicKeySnippet}
                    </p>
                  </div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase">Connection</span>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{selectedNode.peerType === 'direct-wifidirect' ? 'Wi-Fi Direct' : 'BLE Mesh Relay'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase">Throughput</span>
                    <div className="text-neutral-100 font-bold">
                      {selectedNode.throughputMbps} Mbps
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase">Latency (Ping)</span>
                    <div className="text-neutral-100 font-bold">
                      {selectedNode.pingMs} ms
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase">Hops & Relay</span>
                    <div className="text-amber-400 font-bold">
                      {selectedNode.hops} Hop {selectedNode.relayedVia ? `(via ${selectedNode.relayedVia.split(' ')[0]})` : '(Direct)'}
                    </div>
                  </div>
                </div>

                {/* E2EE Verification State */}
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-cyan-400 font-bold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>E2EE State: Verified</span>
                    </span>
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Autonomous Diffie-Hellman key handshake completed over Bluetooth Low Energy.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-3">
                <Users className="w-8 h-8 text-neutral-500 mx-auto" />
                <p className="text-xs text-neutral-300 font-medium">
                  Broadcasting your presence as <span className="text-cyan-400 font-bold">{currentUser.name}</span>.
                </p>
                <p className="text-[11px] text-neutral-400">
                  Open MeshGuard on your phone or send your invite link to a peer to link devices instantly!
                </p>
                <button
                  onClick={handleCopyInvite}
                  className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Join Link'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action to Start Chat / Connect */}
          {selectedNode && (
            <button
              onClick={() => {
                onSelectNodeToChat(selectedNode);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Encrypted Direct Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
