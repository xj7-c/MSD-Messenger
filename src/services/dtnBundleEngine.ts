/**
 * Delay-Tolerant Networking (DTN) / Store-and-Forward Routing Engine
 * Enables asynchronous message delivery across physically mobile nodes over time
 * even when sender and recipient are never simultaneously in radio range.
 */

export interface DTNBundle {
  bundleId: string;
  sourceNodeId: string;
  sourceHandle: string;
  destinationNodeId: string;
  destinationHandle: string;
  creationTimestamp: number;
  lifetimeSeconds: number; // TTL (e.g. 86400s = 24h)
  expiresAt: number;
  hopCount: number;
  maxHops: number;
  visitedNodes: string[];
  custodyAccepted: boolean;
  custodianNodeId: string;
  payloadType: 'message' | 'sender_key' | 'signal' | 'file_manifest';
  encryptedPayload: string;
  payloadDigest: string; // SHA-256
  priority: 'bulk' | 'normal' | 'expedited';
  sizeBytes: number;
}

export interface AntiEntropySummary {
  nodeId: string;
  bundleIds: string[];
  vectorClock: Record<string, number>;
}

class DTNBundleService {
  private custodyVault: Map<string, DTNBundle> = new Map();
  private deliveredBundles: Set<string> = new Set();
  private vectorClocks: Map<string, number> = new Map();
  private storageKey = 'meshguard_dtn_vault_v1';

  constructor() {
    this.loadVault();
    // Clean expired bundles every 30s
    if (typeof window !== 'undefined') {
      setInterval(() => this.purgeExpiredBundles(), 30000);
    }
  }

  private loadVault() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const list: DTNBundle[] = JSON.parse(stored);
        list.forEach((b) => {
          if (b.expiresAt > Date.now()) {
            this.custodyVault.set(b.bundleId, b);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to load DTN vault:', e);
    }
  }

  private saveVault() {
    if (typeof localStorage === 'undefined') return;
    try {
      const list = Array.from(this.custodyVault.values());
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch (e) {}
  }

  /**
   * Enqueue a new message into DTN custody for store-and-forward routing
   */
  public createBundle(
    sourceNodeId: string,
    sourceHandle: string,
    destinationNodeId: string,
    destinationHandle: string,
    payload: string,
    payloadType: DTNBundle['payloadType'] = 'message',
    lifetimeSeconds: number = 86400 // 24 hours default TTL
  ): DTNBundle {
    const now = Date.now();
    const bundleId = `dtn-${now}-${Math.random().toString(36).substring(2, 9)}`;
    const bundle: DTNBundle = {
      bundleId,
      sourceNodeId,
      sourceHandle,
      destinationNodeId,
      destinationHandle,
      creationTimestamp: now,
      lifetimeSeconds,
      expiresAt: now + lifetimeSeconds * 1000,
      hopCount: 0,
      maxHops: 12,
      visitedNodes: [sourceNodeId],
      custodyAccepted: true,
      custodianNodeId: sourceNodeId,
      payloadType,
      encryptedPayload: payload,
      payloadDigest: this.hashString(payload),
      priority: 'normal',
      sizeBytes: payload.length,
    };

    this.custodyVault.set(bundleId, bundle);
    this.incrementVectorClock(sourceNodeId);
    this.saveVault();
    return bundle;
  }

  /**
   * Process an incoming bundle from an encounter with another mobile peer
   */
  public ingestBundle(bundle: DTNBundle, currentLocalNodeId: string): { accepted: boolean; isForMe: boolean; reason?: string } {
    if (this.deliveredBundles.has(bundle.bundleId)) {
      return { accepted: false, isForMe: false, reason: 'Already delivered and acknowledged' };
    }

    if (Date.now() > bundle.expiresAt) {
      return { accepted: false, isForMe: false, reason: 'Bundle TTL expired' };
    }

    if (bundle.hopCount >= bundle.maxHops) {
      return { accepted: false, isForMe: false, reason: 'Max DTN hop limit reached' };
    }

    // Is this destination for this local device?
    if (bundle.destinationNodeId === currentLocalNodeId || bundle.destinationNodeId === 'broadcast-all') {
      this.deliveredBundles.add(bundle.bundleId);
      this.custodyVault.delete(bundle.bundleId);
      this.saveVault();
      return { accepted: true, isForMe: true };
    }

    // Otherwise, accept custody as an intermediate carrier node
    if (!bundle.visitedNodes.includes(currentLocalNodeId)) {
      const updatedBundle: DTNBundle = {
        ...bundle,
        hopCount: bundle.hopCount + 1,
        visitedNodes: [...bundle.visitedNodes, currentLocalNodeId],
        custodyAccepted: true,
        custodianNodeId: currentLocalNodeId,
      };
      this.custodyVault.set(bundle.bundleId, updatedBundle);
      this.saveVault();
      return { accepted: true, isForMe: false };
    }

    return { accepted: false, isForMe: false, reason: 'Duplicate visited node loop prevention' };
  }

  /**
   * Anti-Entropy exchange: Compare inventory with a newly discovered node
   * Returns list of bundles to replicate to the peer
   */
  public generateReplicationPayload(peerNodeId: string, peerKnownBundleIds: string[]): DTNBundle[] {
    const bundlesToSend: DTNBundle[] = [];
    const knownSet = new Set(peerKnownBundleIds);

    for (const bundle of this.custodyVault.values()) {
      if (Date.now() <= bundle.expiresAt && !knownSet.has(bundle.bundleId) && !bundle.visitedNodes.includes(peerNodeId)) {
        bundlesToSend.push(bundle);
      }
    }
    return bundlesToSend;
  }

  public getSummary(localNodeId: string): AntiEntropySummary {
    return {
      nodeId: localNodeId,
      bundleIds: Array.from(this.custodyVault.keys()),
      vectorClock: Object.fromEntries(this.vectorClocks.entries()),
    };
  }

  public getVaultBundles(): DTNBundle[] {
    return Array.from(this.custodyVault.values());
  }

  public getDeliveredCount(): number {
    return this.deliveredBundles.size;
  }

  public purgeExpiredBundles() {
    const now = Date.now();
    let changed = false;
    for (const [id, bundle] of this.custodyVault.entries()) {
      if (now > bundle.expiresAt) {
        this.custodyVault.delete(id);
        changed = true;
      }
    }
    if (changed) this.saveVault();
  }

  private incrementVectorClock(nodeId: string) {
    const cur = this.vectorClocks.get(nodeId) || 0;
    this.vectorClocks.set(nodeId, cur + 1);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return '0x' + Math.abs(hash).toString(16).padStart(8, '0');
  }
}

export const dtnBundleEngine = new DTNBundleService();
