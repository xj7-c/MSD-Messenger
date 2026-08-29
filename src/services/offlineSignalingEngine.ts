/**
 * Offline WebRTC Signaling Protocol over Bluetooth LE / Local mDNS Radio Broadcasts
 * Enables real-time Voice and Video calls to negotiate peer-to-peer WebRTC connections
 * directly between local devices without requiring any internet STUN or TURN servers.
 */

export interface OfflineSignalPacket {
  signalId: string;
  callId: string;
  senderNodeId: string;
  targetNodeId: string;
  type: 'offer' | 'answer' | 'ice_candidate' | 'call_reject' | 'call_hangup';
  sdpOrCandidate: string;
  chunkIndex: number;
  totalChunks: number;
  timestamp: number;
  channel: 'BLE_ADVERT' | 'BLE_GATT' | 'MDNS_LOCAL' | 'WIFI_DIRECT';
}

class OfflineSignalingService {
  private pendingChunks: Map<string, OfflineSignalPacket[]> = new Map();
  private maxChunkSize = 380; // Optimized for BLE MTU / GATT frame

  /**
   * Compress and fragment an SDP Offer/Answer into radio chunks
   */
  public fragmentSdpSignal(
    callId: string,
    senderNodeId: string,
    targetNodeId: string,
    type: 'offer' | 'answer',
    sdp: string,
    channel: OfflineSignalPacket['channel'] = 'BLE_GATT'
  ): OfflineSignalPacket[] {
    const compactSdp = this.compactSdp(sdp);
    const totalChunks = Math.ceil(compactSdp.length / this.maxChunkSize);
    const signalId = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const packets: OfflineSignalPacket[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunkData = compactSdp.substring(i * this.maxChunkSize, (i + 1) * this.maxChunkSize);
      packets.push({
        signalId,
        callId,
        senderNodeId,
        targetNodeId,
        type,
        sdpOrCandidate: chunkData,
        chunkIndex: i,
        totalChunks,
        timestamp: Date.now(),
        channel,
      });
    }

    return packets;
  }

  /**
   * Create an offline ICE Host candidate packet (no STUN/TURN needed for offline direct radio)
   */
  public createOfflineCandidatePacket(
    callId: string,
    senderNodeId: string,
    targetNodeId: string,
    candidate: RTCIceCandidateInit,
    channel: OfflineSignalPacket['channel'] = 'BLE_GATT'
  ): OfflineSignalPacket {
    return {
      signalId: `ice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      callId,
      senderNodeId,
      targetNodeId,
      type: 'ice_candidate',
      sdpOrCandidate: JSON.stringify(candidate),
      chunkIndex: 0,
      totalChunks: 1,
      timestamp: Date.now(),
      channel,
    };
  }

  /**
   * Ingest an incoming radio packet and reassemble when all chunks arrive
   */
  public ingestPacket(packet: OfflineSignalPacket): {
    completed: boolean;
    reassembledPayload?: string;
    type?: OfflineSignalPacket['type'];
    callId?: string;
  } {
    if (packet.totalChunks === 1) {
      const finalPayload = packet.type === 'ice_candidate' ? packet.sdpOrCandidate : this.expandSdp(packet.sdpOrCandidate);
      return {
        completed: true,
        reassembledPayload: finalPayload,
        type: packet.type,
        callId: packet.callId,
      };
    }

    const key = `${packet.callId}:${packet.signalId}`;
    let list = this.pendingChunks.get(key) || [];
    list.push(packet);
    this.pendingChunks.set(key, list);

    if (list.length >= packet.totalChunks) {
      list.sort((a, b) => a.chunkIndex - b.chunkIndex);
      const combined = list.map((p) => p.sdpOrCandidate).join('');
      this.pendingChunks.delete(key);
      return {
        completed: true,
        reassembledPayload: this.expandSdp(combined),
        type: packet.type,
        callId: packet.callId,
      };
    }

    return { completed: false };
  }

  /**
   * Compact standard SDP by stripping extraneous verbose comments to fit BLE MTU
   */
  private compactSdp(sdp: string): string {
    return sdp
      .split('\r\n')
      .filter((line) => !line.startsWith('a=extmap') && !line.startsWith('a=rtcp-fb') && line.trim().length > 0)
      .join('\n');
  }

  private expandSdp(compact: string): string {
    return compact.replace(/\n/g, '\r\n');
  }
}

export const offlineSignalingEngine = new OfflineSignalingService();
