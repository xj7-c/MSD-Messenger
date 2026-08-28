/**
 * MeshGuard Types & Interfaces
 */

export type ConnectivityMode = 'dual-hybrid' | 'offline-mesh-only' | 'internet-only';

export type TransportProtocol = 'BLE Mesh' | 'Wi-Fi Direct' | 'Internet WebSocket' | 'Encrypted P2P';

export type PeerPresence = 'online' | 'mesh-direct' | 'mesh-relay' | 'offline';

export type RoleType = 'owner' | 'admin' | 'moderator' | 'member';

export interface UserBadge {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface UserKeys {
  identityKeyHex: string;
  signedPreKeyHex: string;
  ephemeralKeyHex: string;
  safetyNumber: string; // 12-block 60-digit or 6-block 30-digit
  safetyHex: string;
  fingerprint: string;
}

export type SoundPackType = 'tactical-mesh' | 'soft-chime' | 'cyber-beep' | 'retro-8bit' | 'sonar-sub' | 'sci-fi-pulse' | 'silent';

export interface CustomThemeSettings {
  themeMode: 'frosted-glass' | 'dark-midnight' | 'deep-slate' | 'cyber-neon' | 'solar-amber' | 'paper-light' | 'oled-pure-black' | 'aurora-frost';
  accentColor: string;
  bubbleStyle: 'rounded' | 'cyber-angular' | 'minimal' | 'glassmorphic';
  fontScale: 'compact' | 'normal' | 'large';
  soundFxEnabled: boolean;
  soundPack: SoundPackType;
  customIcon: 'shield-cyan' | 'mesh-radar' | 'secure-key' | 'ghost-privacy';
}

export type NotificationCategory = 'all' | 'messages' | 'mesh-alerts' | 'security' | 'sos';

export interface AppNotification {
  id: string;
  type: 'message' | 'mesh-node-discovered' | 'call-incoming' | 'file-transfer' | 'e2ee-rekey' | 'sos-broadcast' | 'battery-low' | 'relay-hop' | 'system';
  title: string;
  description: string;
  timestamp: number;
  read: boolean;
  category: 'messages' | 'mesh-alerts' | 'security' | 'sos';
  avatar?: string;
  iconType?: string;
  priority?: 'normal' | 'high' | 'urgent';
  actionLabel?: string;
  actionType?: 'open-chat' | 'open-radar' | 'open-transfer' | 'open-security' | 'accept-call';
  chatId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  soundPack: SoundPackType;
  inAppToasts: boolean;
  meshAlerts: boolean;
  securityAlerts: boolean;
  dndActive: boolean;
  dndUntil?: number;
}

export interface ThemeConfig extends CustomThemeSettings {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  avatarFrame: 'none' | 'cyber-ring' | 'mesh-pulse' | 'gold-shield' | 'stealth-matrix' | 'hologram';
  bannerGradient: string;
  bio: string;
  statusMessage: string;
  statusEmoji: string;
  presence: PeerPresence;
  deviceType: 'Phone' | 'Tactical Mesh Node' | 'Laptop' | 'Relay Beacon';
  rssi?: number; // dBm
  batteryLevel: number; // percentage
  distanceMeters?: number;
  keys: UserKeys;
  badges: UserBadge[];
  customTheme?: Partial<CustomThemeSettings>;
}

export interface MeshNode {
  id: string;
  name: string;
  peerType: 'direct-bt' | 'direct-wifidirect' | 'mesh-relay-hop' | 'internet-relay';
  rssi: number;
  hops: number;
  batteryLevel: number;
  pingMs: number;
  throughputMbps: number;
  e2eeStatus: 'verified' | 'handshaking' | 'unverified';
  lastSeen: number;
  relayedVia?: string;
  avatar: string;
  publicKeySnippet: string;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  formattedSize: string;
  mimeType: string;
  sha256Checksum: string;
  chunksTotal: number;
  chunksCompleted: number;
  transferProgress: number; // 0 to 100
  transferSpeedMbps: number;
  isUncompressed: boolean;
  rawDimensions?: string;
  colorDepth?: string;
  bitRate?: string;
  streamUrl?: string;
  previewUrl?: string;
  isTransferring: boolean;
  isCompleted: boolean;
  e2eeVerified: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: number;
  status: 'sending' | 'mesh-relayed' | 'delivered' | 'read' | 'failed';
  transportProtocol: TransportProtocol;
  encryptedPayloadSnippet: string;
  hopsCount: number;
  relayedByNode?: string;
  reactions: MessageReaction[];
  replyToId?: string;
  quoteMessage?: {
    id: string;
    senderName: string;
    content: string;
  };
  fileAttachment?: FileAttachment;
  isEncrypted: boolean;
  selfDestructSec?: number;
  expiresAt?: number;
  isBurned?: boolean;
}

export interface GroupPermissions {
  canSendMessages: boolean;
  canSendMedia: boolean;
  canAddMembers: boolean;
  canPinMessages: boolean;
  canChangeInfo: boolean;
  canCreatePolls: boolean;
}

export interface ChatParticipant {
  user: User;
  role: RoleType;
  joinedAt: number;
  permissions?: GroupPermissions;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name: string;
  description?: string;
  avatar: string;
  participants: ChatParticipant[];
  adminIds: string[];
  ownerId: string;
  lastMessage?: Message;
  unreadCount: number;
  linkSharingCode?: string;
  pinnedMessageId?: string;
  isE2EEVerified: boolean;
  e2eeRatchetState: {
    ratchetStep: number;
    rootKeyFingerprint: string;
    lastRekeyTimestamp: number;
  };
  channelType?: 'direct' | 'mesh-broadcast' | 'encrypted-group' | 'offline-beacon';
  transfersCount?: number;
}

export interface CallQualityMetrics {
  resolution: string;
  fps: number;
  jitterMs: number;
  rttMs: number;
  packetLossPercent: number;
  audioBitrateKbps: number;
  videoBitrateKbps: number;
  codec: string;
  transport: 'Wi-Fi Direct P2P' | 'BLE Audio Stream' | 'WebRTC Direct' | 'Turn Relay';
}

export interface CallSession {
  id: string;
  chatId: string;
  peerUser: User;
  isVideo: boolean;
  status: 'ringing' | 'connected' | 'ended' | 'reconnecting';
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  callDurationSec: number;
  qualityMetrics: CallQualityMetrics;
  spatialAudio: boolean;
  noiseSuppression: boolean;
  isP2PDirect: boolean;
}

export interface CustomEmoji {
  code: string;
  label: string;
  urlOrChar: string;
  isAnimated?: boolean;
  category: 'mesh' | 'cyber' | 'tactical' | 'reactions' | 'custom';
}

export interface CustomSticker {
  id: string;
  name: string;
  previewUrl: string;
  category: string;
  dimensions: string;
}

export interface CustomEmojiPack {
  id: string;
  name: string;
  author: string;
  emojis: CustomEmoji[];
  stickers: CustomSticker[];
}
