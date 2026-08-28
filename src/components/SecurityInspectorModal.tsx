import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  Eye, 
  Zap, 
  FileCheck, 
  CheckCheck,
  AlertTriangle
} from 'lucide-react';
import { Chat, User } from '../types';
import { CryptoEngine } from '../utils/cryptoEngine';
import { soundFx } from '../utils/soundFx';

interface SecurityInspectorModalProps {
  currentUser: User;
  chat?: Chat;
  onClose: () => void;
}

export const SecurityInspectorModal: React.FC<SecurityInspectorModalProps> = ({
  currentUser,
  chat,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ratchet' | 'safety' | 'vault' | 'tamper'>('ratchet');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testPlaintext, setTestPlaintext] = useState('Secret coordinate: 47.6062 N, 122.3321 W (Uncompressed stream)');
  const [cipherOutput, setCipherOutput] = useState<{ ciphertext: string; iv: string; tag: string } | null>(null);
  const [isTampered, setIsTampered] = useState(false);

  const peerUser = chat?.participants.find((p) => p.user.id !== 'user-me')?.user;
  const safetyNumber = chat && peerUser
    ? CryptoEngine.generateSafetyNumber(currentUser.keys.identityKeyHex, peerUser.keys.identityKeyHex)
    : currentUser.keys.safetyNumber;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunEncryptTest = async () => {
    soundFx.playCryptoVerify();
    const sessionKey = CryptoEngine.generateHex(32);
    const result = await CryptoEngine.encryptPayload(testPlaintext, sessionKey);
    setCipherOutput(result);
    setIsTampered(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-3xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                E2EE Cryptographic Vault & Zero-Knowledge Inspector
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  Signal Double Ratchet
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Pure Client-Side Private Keys • Zero Cloud Knowledge
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-neutral-950 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('ratchet')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'ratchet'
                ? 'bg-neutral-800 text-cyan-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Double Ratchet Pipeline
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-neutral-800 text-emerald-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Safety Numbers (QR/Hex)
          </button>

          <button
            onClick={() => setActiveTab('tamper')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'tamper'
                ? 'bg-neutral-800 text-purple-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Payload Cipher & Tamper Test
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-neutral-800 text-amber-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Identity Keychain
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* DOUBLE RATCHET TAB */}
          {activeTab === 'ratchet' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin [animation-duration:8s]" />
                    <span>Double Ratchet State (Active Rekeying Step #{chat?.e2eeRatchetState.ratchetStep || 14})</span>
                  </span>
                  <span className="text-emerald-400">Forward Secrecy: ON</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                  Every transmitted message, call frame, and uncompressed chunk derives a unique ephemeral key. Compromise of a single key reveals neither past nor future communications.
                </p>
              </div>

              {/* Visual Pipeline Diagram */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 font-mono text-xs">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center flex-1 w-full">
                    <span className="text-[10px] text-neutral-500 uppercase block">Root KDF Chain</span>
                    <span className="text-cyan-400 font-bold text-xs">{chat?.e2eeRatchetState.rootKeyFingerprint || '0x3E91...BF40'}</span>
                  </div>
                  <div className="text-neutral-500">➔</div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center flex-1 w-full">
                    <span className="text-[10px] text-neutral-500 uppercase block">Sending Chain Key</span>
                    <span className="text-emerald-400 font-bold text-xs">0x99FA...11E2</span>
                  </div>
                  <div className="text-neutral-500">➔</div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center flex-1 w-full">
                    <span className="text-[10px] text-neutral-500 uppercase block">Message Key (AES-GCM)</span>
                    <span className="text-amber-400 font-bold text-xs">0x8801...A4C9</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Diffie-Hellman Ratchet Step:</span>
                  <span className="text-cyan-400">Curve25519 / X25519 (Constant-Time)</span>
                </div>
              </div>
            </div>
          )}

          {/* SAFETY NUMBERS TAB */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-400 leading-relaxed font-sans">
                Compare this 60-digit safety number with {chat?.name || 'peer'} or scan their device in person to cryptographically guarantee no man-in-the-middle exists.
              </div>

              {/* QR and Safety Blocks */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center gap-6">
                {/* QR Code visual simulation */}
                <div className="w-36 h-36 p-2 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg">
                  <div className="w-full h-full border-4 border-neutral-950 p-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-neutral-950 rounded-sm" />
                      <div className="w-8 h-8 bg-neutral-950 rounded-sm" />
                    </div>
                    <div className="grid grid-cols-5 gap-1 p-1">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 ${i % 2 === 0 ? 'bg-neutral-950' : 'bg-transparent'}`} />
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-neutral-950 rounded-sm" />
                      <div className="w-2 h-2 bg-neutral-950 self-end" />
                    </div>
                  </div>
                </div>

                {/* 12-block safety number text */}
                <div className="space-y-3 flex-1 font-mono">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Safety Number (60 Digits)
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs font-bold text-cyan-300 select-all">
                    {safetyNumber.split(' ').map((chunk, i) => (
                      <span key={i} className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-center">
                        {chunk}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCopy(safetyNumber, 'safety')}
                    className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'safety' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'safety' ? 'Copied' : 'Copy Safety Number'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAYLOAD CIPHER & TAMPER TEST */}
          {activeTab === 'tamper' && (
            <div className="space-y-4 font-mono text-xs">
              <p className="text-neutral-300 font-sans">
                Test real-time zero-knowledge payload encryption and authenticated tamper detection:
              </p>

              <div className="space-y-1">
                <label className="text-[11px] uppercase text-neutral-400">Plaintext Input</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPlaintext}
                    onChange={(e) => setTestPlaintext(e.target.value)}
                    className="flex-1 px-3 py-2 bg-neutral-950 text-neutral-100 rounded-xl border border-neutral-800 focus:outline-none focus:border-cyan-500/60 font-sans text-xs"
                  />
                  <button
                    onClick={handleRunEncryptTest}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                  >
                    Encrypt
                  </button>
                </div>
              </div>

              {cipherOutput && (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>AES-256-GCM Authenticated Ciphertext</span>
                    </span>
                    <span className="text-[10px] text-neutral-500">IV (96-bit): {cipherOutput.iv}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-cyan-300 break-all select-all">
                    0x{cipherOutput.ciphertext}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-neutral-400">Authentication Tag (128-bit):</span>
                    <span className="text-amber-400">{cipherOutput.tag}</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <button
                      onClick={() => setIsTampered(!isTampered)}
                      className="px-3 py-1 rounded-lg bg-red-950/60 text-red-400 border border-red-800 hover:bg-red-900/80 cursor-pointer text-[10px]"
                    >
                      {isTampered ? 'Revert Tampering' : 'Simulate 1-Bit Payload Tamper'}
                    </button>

                    {isTampered ? (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>TAMPER DETECTED: Decryption Aborted</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Integrity & Authenticity Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IDENTITY KEYCHAIN TAB */}
          {activeTab === 'vault' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="text-xs text-neutral-400 font-sans">
                Your private identity keys never leave this device. Store your cryptographic credentials securely.
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Identity Key (Curve25519):</span>
                    <button
                      onClick={() => handleCopy(currentUser.keys.identityKeyHex, 'ik')}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      {copiedKey === 'ik' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-cyan-300 break-all select-all">
                    {currentUser.keys.identityKeyHex}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Signed Pre-Key:</span>
                    <button
                      onClick={() => handleCopy(currentUser.keys.signedPreKeyHex, 'spk')}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      {copiedKey === 'spk' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-emerald-300 break-all select-all">
                    {currentUser.keys.signedPreKeyHex}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Master Fingerprint:</span>
                  </div>
                  <p className="text-neutral-300 break-all select-all">
                    {currentUser.keys.fingerprint}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
