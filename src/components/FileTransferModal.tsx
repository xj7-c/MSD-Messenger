import React, { useState, useRef } from 'react';
import { 
  HardDrive, 
  UploadCloud, 
  Check, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Film, 
  Image as ImageIcon, 
  Music, 
  X, 
  Play, 
  Pause, 
  ArrowRight,
  Sparkles,
  Layers,
  FolderOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileAttachment, MeshNode, User } from '../types';
import { meshEngine } from '../services/meshEngine';
import { soundFx } from '../utils/soundFx';

interface FileTransferModalProps {
  onClose: () => void;
  meshNodes: MeshNode[];
  onTransferCompleted: (file: FileAttachment, recipientNodeId: string) => void;
}

const PRESET_FILES = [
  {
    fileName: 'Cinema_Reel_8K_RED_RAW.r3d',
    fileSizeBytes: 4800000000,
    formattedSize: '4.80 GB',
    mimeType: 'video/x-r3d',
    sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    rawDimensions: '8192 x 4320 (REDCODE 16-bit RAW)',
    bitRate: '450 Mbps Master Stream',
    previewUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    chunksTotal: 80,
  },
  {
    fileName: 'Architectural_Survey_Orthomosaic_DNG.zip',
    fileSizeBytes: 1850000000,
    formattedSize: '1.85 GB',
    mimeType: 'application/zip',
    sha256: '112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
    rawDimensions: '14,000 x 9,200 (Lossless TIFF/DNG)',
    bitRate: 'Zero Compression Archive',
    previewUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
    chunksTotal: 60,
  },
  {
    fileName: 'Symphony_Orchestra_Master_DXD_384kHz.flac',
    fileSizeBytes: 620000000,
    formattedSize: '620 MB',
    mimeType: 'audio/flac',
    sha256: 'ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100',
    rawDimensions: '32-bit Float 384kHz Master',
    bitRate: '9,216 kbps Pure Lossless',
    previewUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    chunksTotal: 40,
  },
];

export const FileTransferModal: React.FC<FileTransferModalProps> = ({
  onClose,
  meshNodes,
  onTransferCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedFilePreset, setSelectedFilePreset] = useState(PRESET_FILES[0]);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState(meshNodes[0]?.id || '');
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speedMbps, setSpeedMbps] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCustomFile(e.target.files[0]);
      setActiveTab('custom');
    }
  };

  const startTransfer = () => {
    setIsTransferring(true);
    setIsFinished(false);
    setProgress(0);
    setCurrentChunk(0);
    soundFx.playSend();

    let attachment: FileAttachment;

    if (activeTab === 'custom' && customFile) {
      const sizeBytes = customFile.size || 50000000;
      const formattedSize =
        sizeBytes > 1000000000
          ? `${(sizeBytes / 1000000000).toFixed(2)} GB`
          : sizeBytes > 1000000
          ? `${(sizeBytes / 1000000).toFixed(1)} MB`
          : `${Math.round(sizeBytes / 1024)} KB`;

      let previewUrl: string | undefined = undefined;
      if (customFile.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(customFile);
      }

      const pseudoSha = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      attachment = {
        id: 'file-' + Date.now(),
        fileName: customFile.name,
        fileSizeBytes: sizeBytes,
        formattedSize: formattedSize,
        mimeType: customFile.type || 'application/octet-stream',
        sha256Checksum: pseudoSha,
        chunksTotal: Math.max(20, Math.min(100, Math.round(sizeBytes / 1000000))),
        chunksCompleted: 0,
        transferProgress: 0,
        transferSpeedMbps: 480,
        isUncompressed: true,
        previewUrl: previewUrl,
        isTransferring: true,
        isCompleted: false,
        e2eeVerified: true,
      };
    } else {
      attachment = {
        id: 'file-' + Date.now(),
        fileName: selectedFilePreset.fileName,
        fileSizeBytes: selectedFilePreset.fileSizeBytes,
        formattedSize: selectedFilePreset.formattedSize,
        mimeType: selectedFilePreset.mimeType,
        sha256Checksum: selectedFilePreset.sha256,
        chunksTotal: selectedFilePreset.chunksTotal,
        chunksCompleted: 0,
        transferProgress: 0,
        transferSpeedMbps: 480,
        isUncompressed: true,
        rawDimensions: selectedFilePreset.rawDimensions,
        bitRate: selectedFilePreset.bitRate,
        previewUrl: selectedFilePreset.previewUrl,
        isTransferring: true,
        isCompleted: false,
        e2eeVerified: true,
      };
    }

    meshEngine.simulateUncompressedTransfer(
      attachment,
      (prog, speed, chunkIdx) => {
        setProgress(prog);
        setSpeedMbps(speed);
        setCurrentChunk(chunkIdx);
      },
      (completed) => {
        setIsTransferring(false);
        setIsFinished(true);
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
          });
        } catch (e) {
          // ignore
        }
        soundFx.playCryptoVerify();
        onTransferCompleted(completed, selectedRecipientId);
      }
    );
  };

  const recipientNode = meshNodes.find((n) => n.id === selectedRecipientId);
  const totalChunks = activeTab === 'custom' && customFile ? 50 : selectedFilePreset.chunksTotal;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomFileSelect}
        className="hidden"
      />

      <div className="w-full max-w-2xl bg-slate-900/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  RAW High-Speed Mesh Transfer Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  Zero Loss
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Direct Wi-Fi Direct / BLE Mesh with Bit-for-Bit SHA-256 Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {/* Tab Selector: Presets vs Custom Device File */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Preset 8K & Master Files
            </button>
            <button
              onClick={() => {
                setActiveTab('custom');
                if (!customFile) fileInputRef.current?.click();
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload Any Local File
            </button>
          </div>

          {/* Preset Selectors */}
          {activeTab === 'presets' ? (
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold block">
                Select Master File Preset
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_FILES.map((file, idx) => (
                  <div
                    key={idx}
                    onClick={() => !isTransferring && setSelectedFilePreset(file)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      selectedFilePreset.fileName === file.fileName
                        ? 'bg-amber-500/15 border-amber-400/50 shadow-md ring-1 ring-amber-400/30'
                        : 'bg-slate-950/40 border-white/10 hover:border-white/20 hover:bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={file.previewUrl}
                          alt={file.fileName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {file.fileName}
                        </p>
                        <p className="text-[11px] font-mono text-amber-300 flex items-center gap-2">
                          <span>{file.formattedSize}</span>
                          <span>•</span>
                          <span>{file.rawDimensions}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 shrink-0">
                      {file.chunksTotal} chunks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Custom File Pick Area */
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold block">
                Local Device File Selected
              </label>
              {customFile ? (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{customFile.name}</p>
                      <p className="text-xs font-mono text-amber-300">
                        {(customFile.size / 1024 / 1024).toFixed(2)} MB • RAW Direct Stream
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-amber-400/60 bg-slate-950/40 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all"
                >
                  <UploadCloud className="w-8 h-8 text-amber-400 animate-bounce" />
                  <p className="text-sm font-bold text-white">Click to Select Any File from Device</p>
                  <p className="text-xs text-slate-400 font-mono">
                    Videos, 3D Models, Archives, Audio stems (up to 100 GB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recipient Node Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase font-semibold block">
              Destination Mesh Peer / Channel
            </label>
            <select
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value)}
              disabled={isTransferring}
              className="w-full p-3 rounded-2xl bg-slate-950/60 border border-white/15 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {meshNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} — {n.peerType === 'direct-wifidirect' ? 'Wi-Fi Direct (480 Mbps)' : 'BLE Mesh Direct'} ({n.rssi} dBm)
                </option>
              ))}
            </select>
          </div>

          {/* Live Progress Bar & Chunk Matrix during transfer */}
          {isTransferring && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-400/40 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  <span>Streaming Uncompressed Payload</span>
                </span>
                <span className="text-emerald-400 font-bold">{progress}% Complete</span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Speed: <strong className="text-white">{speedMbps} Mbps</strong></span>
                <span>Chunk: <strong className="text-white">{currentChunk} / {totalChunks}</strong></span>
                <span className="text-emerald-400">0% Compression</span>
              </div>
            </div>
          )}

          {/* Finished Banner */}
          {isFinished && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between font-mono text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>Payload Transmitted & Verified Bit-for-Bit</span>
              </div>
              <span className="text-white font-bold">100% Zero Loss</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Double Ratchet E2EE Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              {isFinished ? 'Done' : 'Cancel'}
            </button>

            {!isFinished && (
              <button
                onClick={startTransfer}
                disabled={isTransferring || (activeTab === 'custom' && !customFile)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
              >
                {isTransferring ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>Streaming...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Transmit Master File</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
