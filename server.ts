import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface ConnectedPeer {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  deviceType: string;
  batteryLevel: number;
  rssi: number;
  distanceMeters: number;
  keys: {
    identityKeyHex: string;
    signedPreKeyHex: string;
    ephemeralKeyHex: string;
    safetyNumber: string;
    safetyHex: string;
    fingerprint: string;
  };
  presence: 'online' | 'mesh-direct' | 'mesh-relay' | 'offline';
  lastSeen: number;
  pingMs: number;
  throughputMbps: number;
  ws?: WebSocket;
}

const activePeers = new Map<string, ConnectedPeer>();
const chatHistories = new Map<string, any[]>();
const customEmojisRegistry = new Map<string, any>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // HTTP API endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      onlinePeersCount: activePeers.size,
      customEmojisCount: customEmojisRegistry.size,
      timestamp: Date.now(),
    });
  });

  app.get('/api/nodes', (req, res) => {
    const nodes = Array.from(activePeers.values()).map(({ ws, ...nodeInfo }) => ({
      ...nodeInfo,
      lastSeenAgoMs: Date.now() - nodeInfo.lastSeen,
    }));
    res.json({ nodes });
  });

  app.get('/api/chats/:chatId/messages', (req, res) => {
    const { chatId } = req.params;
    res.json({ messages: chatHistories.get(chatId) || [] });
  });

  // Custom Emojis HTTP API
  app.get('/api/emojis', (req, res) => {
    res.json({ emojis: Array.from(customEmojisRegistry.values()) });
  });

  app.post('/api/emojis', (req, res) => {
    const { emoji } = req.body;
    if (emoji && (emoji.code || emoji.shortcode)) {
      const codeKey = (emoji.code || `:${emoji.shortcode}:`).toLowerCase();
      customEmojisRegistry.set(codeKey, emoji);
      broadcastToAll({
        type: 'emoji:registered',
        emoji,
        timestamp: Date.now(),
      });
      return res.json({ status: 'ok', registered: emoji });
    }
    res.status(400).json({ error: 'Invalid emoji object' });
  });

  // Direct HTTP Fallback for sending messages reliably
  app.post('/api/messages/send', (req, res) => {
    const { message, targetPeerId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message payload required' });
    }

    if (message.customEmojisPayload && Array.isArray(message.customEmojisPayload)) {
      for (const emo of message.customEmojisPayload) {
        if (emo && (emo.code || emo.shortcode)) {
          const k = (emo.code || `:${emo.shortcode}:`).toLowerCase();
          customEmojisRegistry.set(k, emo);
        }
      }
    }

    if (message.chatId) {
      const history = chatHistories.get(message.chatId) || [];
      history.push(message);
      if (history.length > 200) history.shift();
      chatHistories.set(message.chatId, history);
    }

    if (targetPeerId && activePeers.has(targetPeerId)) {
      const target = activePeers.get(targetPeerId)!;
      if (target.ws && target.ws.readyState === WebSocket.OPEN) {
        target.ws.send(JSON.stringify({
          type: 'message:received',
          message,
          timestamp: Date.now(),
        }));
      }
    } else {
      broadcastToAll({
        type: 'message:received',
        message,
        timestamp: Date.now(),
      }, message.senderId);
    }

    res.json({ status: 'ok', messageId: message.id, timestamp: Date.now() });
  });

  // Create HTTP Server
  const server = http.createServer(app);

  // Initialize WebSocket Server
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcastToAll(data: any, exceptPeerId?: string) {
    const payload = JSON.stringify(data);
    for (const [peerId, peer] of activePeers.entries()) {
      if (peerId !== exceptPeerId && peer.ws && peer.ws.readyState === WebSocket.OPEN) {
        try {
          peer.ws.send(payload);
        } catch (e) {
          // ignore
        }
      }
    }
  }

  function broadcastNodesList() {
    const nodes = Array.from(activePeers.values()).map(({ ws, ...nodeInfo }) => nodeInfo);
    broadcastToAll({
      type: 'nodes:update',
      nodes,
      timestamp: Date.now(),
    });
  }

  wss.on('connection', (ws: WebSocket) => {
    let currentPeerId: string | null = null;

    ws.on('message', (rawData: string) => {
      try {
        const msg = JSON.parse(rawData.toString());

        switch (msg.type) {
          case 'node:register': {
            const peerData: ConnectedPeer = {
              ...msg.user,
              ws,
              lastSeen: Date.now(),
              pingMs: msg.pingMs || 6,
              throughputMbps: msg.throughputMbps || 480,
              presence: 'online',
            };
            currentPeerId = peerData.id;
            activePeers.set(peerData.id, peerData);

            // Send registration acknowledgment with current active peers & known custom emojis
            const currentNodes = Array.from(activePeers.values()).map(({ ws: _ws, ...rest }) => rest);
            ws.send(JSON.stringify({
              type: 'node:registered',
              yourId: peerData.id,
              activeNodes: currentNodes,
              customEmojis: Array.from(customEmojisRegistry.values()),
              timestamp: Date.now(),
            }));

            // Notify everyone of new peer
            broadcastNodesList();
            break;
          }

          case 'node:ping': {
            if (currentPeerId && activePeers.has(currentPeerId)) {
              const peer = activePeers.get(currentPeerId)!;
              peer.lastSeen = Date.now();
              if (msg.batteryLevel !== undefined) peer.batteryLevel = msg.batteryLevel;
              if (msg.rssi !== undefined) peer.rssi = msg.rssi;
            }
            ws.send(JSON.stringify({ type: 'node:pong', timestamp: Date.now() }));
            break;
          }

          case 'emoji:register': {
            const { emoji } = msg;
            if (emoji && (emoji.code || emoji.shortcode)) {
              const codeKey = (emoji.code || `:${emoji.shortcode}:`).toLowerCase();
              customEmojisRegistry.set(codeKey, emoji);
              broadcastToAll({
                type: 'emoji:registered',
                emoji,
                timestamp: Date.now(),
              });
            }
            break;
          }

          case 'message:send': {
            const { message } = msg;
            if (!message) return;

            // Automatically register any attached custom emojis globally
            if (message.customEmojisPayload && Array.isArray(message.customEmojisPayload)) {
              for (const emo of message.customEmojisPayload) {
                if (emo && (emo.code || emo.shortcode)) {
                  const k = (emo.code || `:${emo.shortcode}:`).toLowerCase();
                  customEmojisRegistry.set(k, emo);
                }
              }
            }

            // Store in chat history
            if (message.chatId) {
              const history = chatHistories.get(message.chatId) || [];
              history.push(message);
              if (history.length > 200) history.shift();
              chatHistories.set(message.chatId, history);
            }

            // Instantly send ACK back to sender so their UI changes from 'sending' to 'sent'
            ws.send(JSON.stringify({
              type: 'message:ack',
              messageId: message.id,
              chatId: message.chatId,
              status: 'sent',
              timestamp: Date.now(),
            }));

            // Target routing or global room broadcast
            if (msg.targetPeerId && activePeers.has(msg.targetPeerId)) {
              const target = activePeers.get(msg.targetPeerId)!;
              if (target.ws && target.ws.readyState === WebSocket.OPEN) {
                target.ws.send(JSON.stringify({
                  type: 'message:received',
                  message,
                  timestamp: Date.now(),
                }));
              }
            } else {
              // Broadcast to all other peers
              broadcastToAll({
                type: 'message:received',
                message,
                timestamp: Date.now(),
              }, currentPeerId || undefined);
            }
            break;
          }

          case 'message:receipt': {
            // Receipt from receiver: 'delivered' or 'seen'
            const { chatId, messageId, senderId, receiptType } = msg;
            if (senderId && activePeers.has(senderId)) {
              const sender = activePeers.get(senderId)!;
              if (sender.ws && sender.ws.readyState === WebSocket.OPEN) {
                sender.ws.send(JSON.stringify({
                  type: 'message:status_update',
                  chatId,
                  messageId,
                  status: receiptType || 'delivered',
                  seenBy: currentPeerId,
                  timestamp: Date.now(),
                }));
              }
            } else {
              // Broadcast receipt update if sender not directly indexed
              broadcastToAll({
                type: 'message:status_update',
                chatId,
                messageId,
                status: receiptType || 'delivered',
                seenBy: currentPeerId,
                timestamp: Date.now(),
              });
            }
            break;
          }

          case 'message:reaction': {
            broadcastToAll({
              type: 'message:reaction_update',
              chatId: msg.chatId,
              messageId: msg.messageId,
              reaction: msg.reaction,
              userId: msg.userId,
            });
            break;
          }

          case 'signal:call_offer':
          case 'signal:call_answer':
          case 'signal:ice_candidate':
          case 'signal:call_end': {
            const { targetPeerId } = msg;
            if (targetPeerId && activePeers.has(targetPeerId)) {
              const target = activePeers.get(targetPeerId)!;
              if (target.ws && target.ws.readyState === WebSocket.OPEN) {
                target.ws.send(JSON.stringify(msg));
              }
            } else {
              // Broadcast signal to all
              broadcastToAll(msg, currentPeerId || undefined);
            }
            break;
          }

          case 'file:chunk_relay': {
            const { targetPeerId } = msg;
            if (targetPeerId && activePeers.has(targetPeerId)) {
              const target = activePeers.get(targetPeerId)!;
              if (target.ws && target.ws.readyState === WebSocket.OPEN) {
                target.ws.send(JSON.stringify(msg));
              }
            } else {
              broadcastToAll(msg, currentPeerId || undefined);
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling websocket message:', err);
      }
    });

    ws.on('close', () => {
      if (currentPeerId && activePeers.has(currentPeerId)) {
        activePeers.delete(currentPeerId);
        broadcastNodesList();
      }
    });

    ws.on('error', (error) => {
      console.warn('WebSocket connection error:', error);
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`MeshGuard real-time server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
