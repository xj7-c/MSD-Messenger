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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // HTTP API endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      onlinePeersCount: activePeers.size,
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

  // Create HTTP Server
  const server = http.createServer(app);

  // Initialize WebSocket Server
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcastToAll(data: any, exceptPeerId?: string) {
    const payload = JSON.stringify(data);
    for (const [peerId, peer] of activePeers.entries()) {
      if (peerId !== exceptPeerId && peer.ws && peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(payload);
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

            // Send registration acknowledgment with current active peers
            const currentNodes = Array.from(activePeers.values()).map(({ ws: _ws, ...rest }) => rest);
            ws.send(JSON.stringify({
              type: 'node:registered',
              yourId: peerData.id,
              activeNodes: currentNodes,
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

          case 'message:send': {
            const { message } = msg;
            if (!message) return;

            // Store in chat history
            if (message.chatId) {
              const history = chatHistories.get(message.chatId) || [];
              history.push(message);
              if (history.length > 200) history.shift();
              chatHistories.set(message.chatId, history);
            }

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
