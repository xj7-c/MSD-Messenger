/**
 * Multi-Device Double Ratchet Synchronization Architecture
 * Manages identity root keys, device subkey trees, and cross-device session states
 * across a user's phone, laptop, and tablet with catchup synchronization for offline messages.
 */

export interface RegisteredDevice {
  deviceId: string;
  deviceName: string;
  deviceType: 'Phone' | 'Laptop' | 'Tablet' | 'Relay Beacon';
  ephemeralPublicHex: string;
  lastActiveTimestamp: number;
  syncSequenceNumber: number;
  isPrimary: boolean;
  status: 'online' | 'mesh-syncing' | 'offline';
}

export interface SyncMessageEnvelope {
  syncId: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  originalChatId: string;
  originalMessageId: string;
  encryptedContent: string;
  timestamp: number;
  sequenceNumber: number;
  isAcked: boolean;
}

class MultiDeviceSyncService {
  private currentDeviceId: string = 'dev-phone-primary';
  private masterIdentityRootHex: string = '0x94f1c7d2e08a6b359f9a2b84c173e495a01f82d4';
  private devices: Map<string, RegisteredDevice> = new Map();
  private pendingSyncQueue: SyncMessageEnvelope[] = [];
  private deviceRatchetStates: Map<string, { rootKey: string; chainIndex: number }> = new Map();

  constructor() {
    this.initDefaultDevices();
  }

  private initDefaultDevices() {
    this.devices.set('dev-phone-primary', {
      deviceId: 'dev-phone-primary',
      deviceName: 'Pixel 9 Pro (Primary Mobile)',
      deviceType: 'Phone',
      ephemeralPublicHex: '0x88ea3091fa4b',
      lastActiveTimestamp: Date.now(),
      syncSequenceNumber: 142,
      isPrimary: true,
      status: 'online',
    });

    this.devices.set('dev-laptop-macbook', {
      deviceId: 'dev-laptop-macbook',
      deviceName: 'MacBook Pro M3 (Field Workstation)',
      deviceType: 'Laptop',
      ephemeralPublicHex: '0x49c0d12e882a',
      lastActiveTimestamp: Date.now() - 1000 * 60 * 15,
      syncSequenceNumber: 139,
      isPrimary: false,
      status: 'mesh-syncing',
    });

    this.devices.set('dev-tablet-ipad', {
      deviceId: 'dev-tablet-ipad',
      deviceName: 'iPad Tactical Command (Standby)',
      deviceType: 'Tablet',
      ephemeralPublicHex: '0x12b59f3d9021',
      lastActiveTimestamp: Date.now() - 1000 * 60 * 120,
      syncSequenceNumber: 118,
      isPrimary: false,
      status: 'offline',
    });
  }

  public getDevices(): RegisteredDevice[] {
    return Array.from(this.devices.values());
  }

  public getPrimaryIdentityRoot(): string {
    return this.masterIdentityRootHex;
  }

  public getMyDeviceId(): string {
    return this.currentDeviceId;
  }

  public setMyDeviceId(deviceId: string) {
    this.currentDeviceId = deviceId;
  }

  /**
   * Fan-out a newly sent/received message to all secondary devices of the user
   */
  public enqueueCrossDeviceSync(originalChatId: string, originalMessageId: string, content: string): SyncMessageEnvelope[] {
    const generated: SyncMessageEnvelope[] = [];
    for (const dev of this.devices.values()) {
      if (dev.deviceId !== this.currentDeviceId) {
        const syncEnv: SyncMessageEnvelope = {
          syncId: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sourceDeviceId: this.currentDeviceId,
          targetDeviceId: dev.deviceId,
          originalChatId,
          originalMessageId,
          encryptedContent: `[CrossDeviceRatchet:${content.substring(0, 16)}]`,
          timestamp: Date.now(),
          sequenceNumber: dev.syncSequenceNumber + 1,
          isAcked: dev.status === 'online',
        };
        this.pendingSyncQueue.push(syncEnv);
        generated.push(syncEnv);
      }
    }
    return generated;
  }

  /**
   * Reconcile missed offline messages for a newly reconnected device
   */
  public reconcileDeviceCatchup(targetDeviceId: string): SyncMessageEnvelope[] {
    const dev = this.devices.get(targetDeviceId);
    if (!dev) return [];

    dev.status = 'online';
    dev.lastActiveTimestamp = Date.now();

    const pending = this.pendingSyncQueue.filter((s) => s.targetDeviceId === targetDeviceId && !s.isAcked);
    pending.forEach((p) => {
      p.isAcked = true;
      dev.syncSequenceNumber = Math.max(dev.syncSequenceNumber, p.sequenceNumber);
    });

    return pending;
  }

  public registerNewDevice(name: string, type: RegisteredDevice['deviceType']): RegisteredDevice {
    const id = `dev-${type.toLowerCase()}-${Date.now().toString(36)}`;
    const newDev: RegisteredDevice = {
      deviceId: id,
      deviceName: name,
      deviceType: type,
      ephemeralPublicHex: '0x' + Math.random().toString(16).substring(2, 14),
      lastActiveTimestamp: Date.now(),
      syncSequenceNumber: 1,
      isPrimary: false,
      status: 'online',
    };
    this.devices.set(id, newDev);
    return newDev;
  }

  public getPendingQueue(): SyncMessageEnvelope[] {
    return this.pendingSyncQueue;
  }
}

export const multiDeviceSyncEngine = new MultiDeviceSyncService();
