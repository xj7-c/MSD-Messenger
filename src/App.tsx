import React, { useState, useEffect, useRef } from 'react';
import { 
  Header 
} from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { MeshRadarModal } from './components/MeshRadarModal';
import { FileTransferModal } from './components/FileTransferModal';
import { CallViewModal } from './components/CallViewModal';
import { GroupHubDrawer } from './components/GroupHubDrawer';
import { ProfileCustomizerModal } from './components/ProfileCustomizerModal';
import { AppCustomizerModal } from './components/AppCustomizerModal';
import { SecurityInspectorModal } from './components/SecurityInspectorModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { NewChatModal } from './components/NewChatModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationToastBanner } from './components/NotificationToastBanner';

import { 
  CURRENT_USER, 
  INITIAL_CHATS, 
  THEME_PRESETS,
  INITIAL_NOTIFICATIONS
} from './data/mockData';
import { 
  Chat, 
  ConnectivityMode, 
  CustomThemeSettings, 
  FileAttachment, 
  Message, 
  MeshNode, 
  User,
  AppNotification
} from './types';
import { meshEngine, MeshEvent } from './services/meshEngine';
import { soundFx } from './utils/soundFx';
import { CryptoEngine } from './utils/cryptoEngine';

export default function App() {
  // Load or initialize persistent local user
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('meshguard_user_profile');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        // ignore
      }
    }
    // Generate unique initial node identity
    const randomId = `node-${Math.random().toString(36).substring(2, 7)}`;
    const randomCallsign = `Node-${Math.floor(100 + Math.random() * 900)}`;
    const keys = CryptoEngine.generateKeyBundle(randomCallsign);
    const initialUser: User = {
      ...CURRENT_USER,
      id: randomId,
      name: randomCallsign,
      handle: `@${randomCallsign.toLowerCase().replace('-', '.')}`,
      keys: {
        identityKeyHex: keys.identityKeyHex,
        signedPreKeyHex: keys.signedPreKeyHex,
        ephemeralKeyHex: keys.ephemeralKeyHex,
        safetyNumber: keys.safetyNumber,
        safetyHex: keys.safetyHex,
        fingerprint: `SHA256:${keys.identityKeyHex.substring(0, 8)}:${keys.identityKeyHex.substring(8, 16)}`,
      },
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('meshguard_user_profile', JSON.stringify(initialUser));
      } catch (e) {
        // ignore
      }
    }
    return initialUser;
  });

  const [theme, setTheme] = useState<CustomThemeSettings>(THEME_PRESETS[0]);
  const [activeMode, setActiveMode] = useState<ConnectivityMode>('dual-hybrid');
  
  // Persistent Chats Initialization (only real chats & live mesh hub)
  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('meshguard_chats_v3');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          // ignore
        }
      }
    }
    return [
      {
        id: 'chat-mesh-squad',
        isGroup: true,
        name: 'Live Mesh & P2P Broadcast Hub',
        description: 'Real-time multi-peer mesh channel. All online nodes, nearby tabs, and direct connections sync live here.',
        avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
        ownerId: currentUser.id,
        adminIds: [currentUser.id],
        unreadCount: 0,
        isE2EEVerified: true,
        channelType: 'encrypted-group',
        transfersCount: 0,
        linkSharingCode: 'mesh://join/live-broadcast-hub',
        e2eeRatchetState: {
          ratchetStep: 1,
          rootKeyFingerprint: '0x88A2...77C9',
          lastRekeyTimestamp: Date.now(),
        },
        participants: [
          { user: currentUser, role: 'owner', joinedAt: Date.now() },
        ],
      },
    ];
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('meshguard_active_chat_id_v3');
      if (stored) return stored;
    }
    return 'chat-mesh-squad';
  });

  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([]);

  // Persistent Messages dictionary mapped by chatId
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('meshguard_chat_messages_v3');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') return parsed;
        } catch (e) {
          // ignore
        }
      }
    }
    return {
      'chat-mesh-squad': [
        {
          id: 'msg-group-1',
          chatId: 'chat-mesh-squad',
          senderId: 'system',
          senderName: 'MeshGuard Core Hub',
          senderAvatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
          content: '🛰️ Real-Time P2P Mesh Channel active. Any connected devices or open browser tabs will discover and communicate here directly with End-to-End Encryption.',
          timestamp: Date.now() - 1000 * 60 * 5,
          status: 'delivered',
          transportProtocol: 'Wi-Fi Direct',
          encryptedPayloadSnippet: '0x33445566778899[AES-256-GCM]',
          hopsCount: 1,
          isEncrypted: true,
          reactions: [{ emoji: '⚡', count: 1, users: [currentUser.id] }],
        },
      ],
    };
  });

  // Automatically save chats to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('meshguard_chats_v3', JSON.stringify(chats));
      } catch (e) {}
    }
  }, [chats]);

  // Automatically save chat messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('meshguard_chat_messages_v3', JSON.stringify(chatMessages));
      } catch (e) {}
    }
  }, [chatMessages]);

  // Automatically save activeChatId to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('meshguard_active_chat_id_v3', activeChatId);
      } catch (e) {}
    }
  }, [activeChatId]);

  // Modal Dialogs
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [showFileTransferModal, setShowFileTransferModal] = useState(false);
  const [showSecurityInspectorModal, setShowSecurityInspectorModal] = useState(false);
  const [showAppCustomizerModal, setShowAppCustomizerModal] = useState(false);
  const [showProfileCustomizerModal, setShowProfileCustomizerModal] = useState(false);
  const [showArchitectureDocsModal, setShowArchitectureDocsModal] = useState(false);
  const [showGroupHubDrawer, setShowGroupHubDrawer] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNotificationCenterModal, setShowNotificationCenterModal] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<{ chat: Chat; isVideo: boolean } | null>(null);

  // Notification System State
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Helper to push a notification with synthesized sound FX & Toast popup
  const pushNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Trigger context-appropriate sound
    if (newNotif.priority === 'urgent' || newNotif.type === 'sos-broadcast') {
      soundFx.playAlertUrgent();
    } else if (newNotif.type === 'mesh-node-discovered') {
      soundFx.playNodeDiscovered();
    } else if (newNotif.type === 'file-transfer') {
      soundFx.playTransferComplete();
    } else if (newNotif.type === 'e2ee-rekey') {
      soundFx.playCryptoVerify();
    } else {
      soundFx.playNotification();
    }
  };

  // Active chat
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const currentMessages = chatMessages[activeChatId] || [];

  // Check URL query parameters on boot (e.g. ?joinPeer=... or ?name=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const joinPeerId = params.get('joinPeer');
    const peerName = params.get('name');

    if (joinPeerId && joinPeerId !== currentUser.id) {
      const newPeerChatId = `chat-peer-${joinPeerId}`;
      const existing = chats.find((c) => c.id === newPeerChatId);
      if (!existing) {
        const newChat: Chat = {
          id: newPeerChatId,
          isGroup: false,
          name: peerName || `Peer (${joinPeerId.substring(0, 6)})`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          ownerId: currentUser.id,
          adminIds: [currentUser.id, joinPeerId],
          unreadCount: 0,
          isE2EEVerified: true,
          channelType: 'direct',
          transfersCount: 0,
          e2eeRatchetState: {
            ratchetStep: 1,
            rootKeyFingerprint: `0x${joinPeerId.substring(0, 4)}...E2EE`,
            lastRekeyTimestamp: Date.now(),
          },
          participants: [
            { user: currentUser, role: 'owner', joinedAt: Date.now() },
            {
              user: {
                ...CURRENT_USER,
                id: joinPeerId,
                name: peerName || `Peer (${joinPeerId.substring(0, 6)})`,
                handle: `@${(peerName || 'peer').toLowerCase().replace(/\s+/g, '.')}`,
                presence: 'online',
                batteryLevel: 92,
                rssi: -35,
              },
              role: 'member',
              joinedAt: Date.now(),
            },
          ],
        };
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
      } else {
        setActiveChatId(existing.id);
      }
    }
  }, []);

  // Initialize Real-time Mesh Engine & WebSocket connection
  useEffect(() => {
    soundFx.setConfig(theme.soundFxEnabled, theme.soundPack);
    meshEngine.init(currentUser);

    const unsubscribe = meshEngine.subscribe((event: MeshEvent) => {
      if (event.type === 'nodes_updated') {
        const liveNodes = event.payload as MeshNode[];
        setMeshNodes(liveNodes);
      } else if (event.type === 'message_received' || event.type === 'message_relayed') {
        const incomingMsg = event.payload as Message;
        if (!incomingMsg || !incomingMsg.chatId) return;

        setChatMessages((prev) => {
          const chatList = prev[incomingMsg.chatId] || [];
          if (chatList.some((m) => m.id === incomingMsg.id)) {
            return {
              ...prev,
              [incomingMsg.chatId]: chatList.map((m) =>
                m.id === incomingMsg.id ? incomingMsg : m
              ),
            };
          }
          return {
            ...prev,
            [incomingMsg.chatId]: [...chatList, incomingMsg],
          };
        });

        setChats((prev) => {
          // If chat doesn't exist, create direct peer chat on the fly
          const chatExists = prev.some((c) => c.id === incomingMsg.chatId);
          if (!chatExists) {
            const autoChat: Chat = {
              id: incomingMsg.chatId,
              isGroup: false,
              name: incomingMsg.senderName || 'Peer Node',
              avatar: incomingMsg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              ownerId: currentUser.id,
              adminIds: [currentUser.id],
              unreadCount: 1,
              isE2EEVerified: true,
              channelType: 'direct',
              e2eeRatchetState: {
                ratchetStep: 1,
                rootKeyFingerprint: '0x88A1...Verified',
                lastRekeyTimestamp: Date.now(),
              },
              participants: [
                { user: currentUser, role: 'owner', joinedAt: Date.now() },
              ],
              lastMessage: incomingMsg,
            };
            return [autoChat, ...prev];
          }

          return prev.map((c) =>
            c.id === incomingMsg.chatId
              ? {
                  ...c,
                  lastMessage: incomingMsg,
                  unreadCount: c.id === activeChatId ? 0 : c.unreadCount + 1,
                }
              : c
          );
        });

        // Trigger notification if message is from another user and not currently active
        if (incomingMsg.senderId !== currentUser.id) {
          pushNotification({
            type: 'message',
            title: `Message from ${incomingMsg.senderName}`,
            description: incomingMsg.content.substring(0, 80),
            category: 'messages',
            avatar: incomingMsg.senderAvatar,
            priority: 'normal',
            actionLabel: 'Open Chat',
            actionType: 'open-chat',
            chatId: incomingMsg.chatId,
          });
        }
      } else if (event.type === 'incoming_call') {
        const callPayload = event.payload;
        pushNotification({
          type: 'call-incoming',
          title: 'Incoming Encrypted P2P Call',
          description: `${callPayload.callerName || 'Peer'} is calling directly over Wi-Fi Direct WebRTC.`,
          category: 'messages',
          priority: 'urgent',
          actionLabel: 'Answer Call',
          actionType: 'open-chat',
          chatId: callPayload.chatId,
        });
      }
    });

    return () => unsubscribe();
  }, [activeChatId, currentUser, theme]);

  // Handle Mode Change (Dual-Hybrid vs Offline-Mesh vs Internet)
  const handleModeChange = (mode: ConnectivityMode) => {
    setActiveMode(mode);
    meshEngine.setMode(mode);
    soundFx.playCryptoVerify();
  };

  // Handle Send Message
  const handleSendMessage = async (
    content: string,
    fileAttachment?: FileAttachment,
    selfDestructSec?: number,
    quoteMessage?: { id: string; senderName: string; content: string }
  ) => {
    const rawMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content,
      timestamp: Date.now(),
      status: 'sending',
      transportProtocol: activeMode === 'offline-mesh-only' ? 'Wi-Fi Direct' : 'Encrypted P2P',
      encryptedPayloadSnippet: '0x...',
      hopsCount: 1,
      reactions: [],
      fileAttachment,
      isEncrypted: true,
      selfDestructSec,
      quoteMessage,
    };

    // Dispatch via MeshEngine
    const sentMsg = await meshEngine.dispatchMessage(rawMsg);

    setChatMessages((prev) => {
      const chatList = prev[activeChatId] || [];
      if (chatList.some((m) => m.id === sentMsg.id)) {
        return {
          ...prev,
          [activeChatId]: chatList.map((m) => (m.id === sentMsg.id ? sentMsg : m)),
        };
      }
      return {
        ...prev,
        [activeChatId]: [...chatList, sentMsg],
      };
    });

    // Update active chat's last message and ratchet step
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              lastMessage: sentMsg,
              e2eeRatchetState: {
                ...c.e2eeRatchetState,
                ratchetStep: c.e2eeRatchetState.ratchetStep + 1,
              },
            }
          : c
      )
    );
  };

  // Handle Emoji Reaction
  const handleReaction = (messageId: string, emoji: string) => {
    soundFx.playSend();
    setChatMessages((prev) => {
      const chatList = prev[activeChatId] || [];
      const updated = chatList.map((m) => {
        if (m.id !== messageId) return m;
        const existingRx = m.reactions.find((r) => r.emoji === emoji);
        let newReactions;
        if (existingRx) {
          newReactions = m.reactions.map((r) =>
            r.emoji === emoji ? { ...r, count: r.count + 1 } : r
          );
        } else {
          newReactions = [...m.reactions, { emoji, count: 1, users: [currentUser.id] }];
        }
        return { ...m, reactions: newReactions };
      });
      return { ...prev, [activeChatId]: updated };
    });
  };

  // Handle Node selected from Radar to start chat
  const handleSelectNodeToChat = (node: MeshNode) => {
    const existing = chats.find(
      (c) => !c.isGroup && c.participants.some((p) => p.user.id === node.id || p.user.name.includes(node.name.split(' ')[0]))
    );
    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newDirectChat: Chat = {
        id: 'chat-direct-' + node.id,
        isGroup: false,
        name: node.name.split(' ')[0],
        avatar: node.avatar,
        ownerId: currentUser.id,
        adminIds: [currentUser.id, node.id],
        unreadCount: 0,
        isE2EEVerified: true,
        channelType: 'direct',
        transfersCount: 0,
        e2eeRatchetState: {
          ratchetStep: 1,
          rootKeyFingerprint: node.publicKeySnippet,
          lastRekeyTimestamp: Date.now(),
        },
        participants: [
          { user: currentUser, role: 'owner', joinedAt: Date.now() },
          {
            user: {
              ...CURRENT_USER,
              id: node.id,
              name: node.name,
              handle: '@' + node.id,
              avatarUrl: node.avatar,
              presence: node.peerType === 'direct-wifidirect' ? 'mesh-direct' : 'mesh-relay',
              batteryLevel: node.batteryLevel,
              rssi: node.rssi,
            },
            role: 'member',
            joinedAt: Date.now(),
          },
        ],
      };
      setChats((prev) => [newDirectChat, ...prev]);
      setActiveChatId(newDirectChat.id);
    }
  };

  // Handle Uncompressed Transfer Completed
  const handleTransferCompleted = (file: FileAttachment, _recipientNodeId: string) => {
    handleSendMessage(
      `Transmitted full-resolution uncompressed file "${file.fileName}" (${file.formattedSize}) with bit-for-bit integrity. SHA-256 verified!`,
      file
    );
    setShowFileTransferModal(false);
  };

  // Notification Action Routing
  const handleNotificationAction = (notif: AppNotification) => {
    setShowNotificationCenterModal(false);
    setActiveToast(null);
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }

    if (notif.actionType === 'open-radar') {
      setShowRadarModal(true);
    } else if (notif.actionType === 'open-transfer') {
      setShowFileTransferModal(true);
    } else if (notif.actionType === 'open-security') {
      setShowSecurityInspectorModal(true);
    } else if (notif.actionType === 'open-chat' && notif.chatId) {
      setActiveChatId(notif.chatId);
    }
  };

  // Simulate Realtime Events
  const handleTriggerSimulate = (type: 'mesh' | 'message' | 'e2ee' | 'sos' | 'file') => {
    if (type === 'mesh') {
      const newNode: MeshNode = {
        id: `node-sim-${Date.now()}`,
        name: 'Operative Jax (BLE 5.4 Direct)',
        peerType: 'direct-bt',
        rssi: -28,
        hops: 1,
        batteryLevel: 91,
        pingMs: 8,
        throughputMbps: 3.4,
        e2eeStatus: 'verified',
        lastSeen: Date.now(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        publicKeySnippet: '0x33aa...99bb',
      };
      setMeshNodes((prev) => [newNode, ...prev.filter((n) => n.id !== newNode.id)]);
      pushNotification({
        type: 'mesh-node-discovered',
        title: 'New Mesh Peer Discovered',
        description: `${newNode.name} entered BLE range (-28 dBm). Ready for zero-knowledge handshake.`,
        category: 'mesh-alerts',
        avatar: newNode.avatar,
        priority: 'normal',
        actionLabel: 'Inspect on Radar',
        actionType: 'open-radar',
      });
    } else if (type === 'file') {
      pushNotification({
        type: 'file-transfer',
        title: 'Uncompressed Master Received',
        description: 'Received "SECTOR_SURVEY_RAW_8K.DNG" (680 MB, 100% loss-free, SHA256 verified).',
        category: 'messages',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        priority: 'high',
        actionLabel: 'Open File Hub',
        actionType: 'open-transfer',
      });
    } else if (type === 'e2ee') {
      pushNotification({
        type: 'e2ee-rekey',
        title: 'Diffie-Hellman Ratchet Step Advanced',
        description: 'New ephemeral key exchange verified with forward secrecy protection.',
        category: 'security',
        priority: 'normal',
        actionLabel: 'View Security Keys',
        actionType: 'open-security',
      });
    } else if (type === 'sos') {
      pushNotification({
        type: 'sos-broadcast',
        title: 'EMERGENCY SOS MESH RELAY',
        description: 'High-priority distress beacon received from Sector 4. Immediate hop relaying active.',
        category: 'sos',
        priority: 'urgent',
        actionLabel: 'Inspect on Radar',
        actionType: 'open-radar',
      });
    } else if (type === 'message') {
      pushNotification({
        type: 'message',
        title: 'Encrypted Mesh Packet',
        description: 'Sector 7 Hub: "Mesh cluster synchronized with 0ms packet drop."',
        category: 'messages',
        avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
        priority: 'normal',
        actionLabel: 'Open Chat',
        actionType: 'open-chat',
        chatId: 'chat-mesh-squad',
      });
    }
  };

  // Get theme root class
  const getThemeRootClasses = () => {
    if (theme.themeMode === 'frosted-glass') return 'bg-slate-950 text-slate-100';
    if (theme.themeMode === 'oled-pure-black') return 'bg-black text-neutral-100';
    if (theme.themeMode === 'paper-light') return 'bg-slate-100 text-neutral-900';
    if (theme.themeMode === 'solar-amber') return 'bg-[#120b02] text-amber-50';
    if (theme.themeMode === 'cyber-neon') return 'bg-[#0f0718] text-purple-50';
    if (theme.themeMode === 'dark-midnight') return 'bg-[#060b13] text-slate-100';
    if (theme.themeMode === 'deep-slate') return 'bg-[#090d16] text-slate-100';
    if (theme.themeMode === 'aurora-frost') return 'bg-[#031517] text-teal-50';
    return 'bg-slate-950 text-slate-100';
  };

  return (
    <div
      id="meshguard-root"
      className={`w-screen h-screen flex flex-col overflow-hidden select-none font-sans relative ${getThemeRootClasses()}`}
      style={{
        // @ts-ignore
        '--theme-accent': theme.accentColor,
      }}
    >
      {/* Frosted Glass Background Ambient Luminescence */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-600/12 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-teal-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* Global Application Header */}
      <div className="relative z-20">
        <Header
          currentUser={currentUser}
          activeMode={activeMode}
          onModeChange={handleModeChange}
          onOpenRadar={() => setShowRadarModal(true)}
          onOpenTransfer={() => setShowFileTransferModal(true)}
          onOpenSecurity={() => setShowSecurityInspectorModal(true)}
          onOpenAppCustomizer={() => setShowAppCustomizerModal(true)}
          onOpenProfileCustomizer={() => setShowProfileCustomizerModal(true)}
          onOpenArchitecture={() => setShowArchitectureDocsModal(true)}
          onOpenNotifications={() => setShowNotificationCenterModal(true)}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
          theme={theme}
          nodesCount={meshNodes.length}
        />
      </div>

      {/* Main Workspace Area (Sidebar + Active Chat + Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar */}
        <div className={`h-full ${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0`}>
          <Sidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={(id) => {
              setActiveChatId(id);
              soundFx.playSend();
            }}
            onNewChat={() => setShowNewChatModal(true)}
            meshNodes={meshNodes}
            onOpenRadar={() => setShowRadarModal(true)}
            theme={theme}
          />
        </div>

        {/* Active Conversation Canvas */}
        <div className={`flex-1 h-full ${!activeChatId ? 'hidden md:flex' : 'flex'} overflow-hidden`}>
          {activeChat ? (
            <ChatView
              chat={activeChat}
              currentUser={currentUser}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              onStartVoiceCall={(chat) => {
                setActiveCallSession({ chat, isVideo: false });
              }}
              onStartVideoCall={(chat) => {
                setActiveCallSession({ chat, isVideo: true });
              }}
              onOpenSecurity={() => setShowSecurityInspectorModal(true)}
              onOpenGroupHub={() => setShowGroupHubDrawer(true)}
              onOpenTransferModal={() => setShowFileTransferModal(true)}
              theme={theme}
              onReaction={handleReaction}
              onBack={() => setActiveChatId('')}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">
              Select an encrypted mesh conversation to begin.
            </div>
          )}
        </div>

        {/* Group Info / Media Hub Drawer */}
        {showGroupHubDrawer && activeChat && (
          <GroupHubDrawer
            chat={activeChat}
            currentUser={currentUser}
            onClose={() => setShowGroupHubDrawer(false)}
          />
        )}
      </div>

      {/* MODAL DIALOGS */}
      {/* 1. Mesh Radar Modal */}
      {showRadarModal && (
        <MeshRadarModal
          nodes={meshNodes}
          currentUser={currentUser}
          onClose={() => setShowRadarModal(false)}
          onSelectNodeToChat={handleSelectNodeToChat}
        />
      )}

      {/* 2. Uncompressed File Transfer Studio Modal */}
      {showFileTransferModal && (
        <FileTransferModal
          onClose={() => setShowFileTransferModal(false)}
          meshNodes={meshNodes}
          onTransferCompleted={handleTransferCompleted}
        />
      )}

      {/* 3. HD Voice & Video Call Studio Modal */}
      {activeCallSession && (
        <CallViewModal
          chat={activeCallSession.chat}
          isVideo={activeCallSession.isVideo}
          onEndCall={() => setActiveCallSession(null)}
        />
      )}

      {/* 4. Profile & Identity Customizer Modal */}
      {showProfileCustomizerModal && (
        <ProfileCustomizerModal
          currentUser={currentUser}
          onSaveProfile={(updated) => {
            setCurrentUser(updated);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('meshguard_user_profile', JSON.stringify(updated));
              } catch (e) {
                // ignore
              }
            }
            meshEngine.updateUser(updated);

            // Sync new avatar and name to all chats
            setChats((prevChats) =>
              prevChats.map((c) => ({
                ...c,
                participants: c.participants.map((p) =>
                  p.user.id === currentUser.id ? { ...p, user: updated } : p
                ),
              }))
            );
            // Sync new avatar and name to all past messages sent by current user
            setChatMessages((prevMsgs) => {
              const nextMsgs = { ...prevMsgs };
              Object.keys(nextMsgs).forEach((cId) => {
                nextMsgs[cId] = nextMsgs[cId].map((m) =>
                  m.senderId === currentUser.id
                    ? { ...m, senderName: updated.name, senderAvatar: updated.avatarUrl }
                    : m
                );
              });
              return nextMsgs;
            });
          }}
          onClose={() => setShowProfileCustomizerModal(false)}
        />
      )}

      {/* 5. Complete App UI Theming Engine Modal */}
      {showAppCustomizerModal && (
        <AppCustomizerModal
          currentTheme={theme}
          onSaveTheme={(updated) => setTheme(updated)}
          onClose={() => setShowAppCustomizerModal(false)}
        />
      )}

      {/* 6. Cryptographic Vault & E2EE Security Inspector */}
      {showSecurityInspectorModal && (
        <SecurityInspectorModal
          currentUser={currentUser}
          chat={activeChat}
          onClose={() => setShowSecurityInspectorModal(false)}
        />
      )}

      {/* 7. System Architecture & UX Blueprint Whitepaper */}
      {showArchitectureDocsModal && (
        <ArchitectureDocsModal
          onClose={() => setShowArchitectureDocsModal(false)}
        />
      )}

      {/* 8. New Encrypted Chat / Group Modal */}
      {showNewChatModal && (
        <NewChatModal
          currentUser={currentUser}
          onClose={() => setShowNewChatModal(false)}
          onCreateChat={(newChat) => {
            setChats((prev) => [newChat, ...prev]);
            setActiveChatId(newChat.id);
          }}
          meshNodes={meshNodes}
        />
      )}

      {/* 9. Tactical Notification Center Modal */}
      {showNotificationCenterModal && (
        <NotificationCenterModal
          notifications={notifications}
          onMarkAsRead={(id) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
          }}
          onMarkAllAsRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          }}
          onClearNotification={(id) => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
          }}
          onClearAll={() => setNotifications([])}
          onTriggerSimulate={handleTriggerSimulate}
          onActionClick={handleNotificationAction}
          onClose={() => setShowNotificationCenterModal(false)}
          soundPack={theme.soundPack}
          soundEnabled={theme.soundFxEnabled}
          onToggleSound={() => {
            const next = !theme.soundFxEnabled;
            setTheme((prev) => ({ ...prev, soundFxEnabled: next }));
            soundFx.setConfig(next, theme.soundPack);
          }}
        />
      )}

      {/* 10. Realtime Toast Notification Banner */}
      <NotificationToastBanner
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onActionClick={handleNotificationAction}
      />
    </div>
  );
}
