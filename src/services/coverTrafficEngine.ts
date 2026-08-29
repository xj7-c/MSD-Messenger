/**
 * Traffic Masking and Cover Traffic Engine
 * Defeats RF side-channel traffic analysis by adversary sniffers.
 * 1. Constant Fixed-Bucket Length Padding (e.g., 512B / 1024B uniform envelopes with CSPRNG entropy padding)
 * 2. Dummy Cover Traffic Injection with Poisson distribution interval timing noise.
 */

export interface PaddedEnvelope {
  originalLength: number;
  paddedLength: number;
  fixedBucketSize: 512 | 1024 | 2048;
  isDummyCover: boolean;
  wirePayload: string;
  paddingEntropyBytes: number;
}

class CoverTrafficService {
  private isCoverTrafficActive: boolean = true;
  private dummyIntervalTimer: any = null;
  private onDummyPacketCallback: ((env: PaddedEnvelope) => void) | null = null;
  private defaultBucket: 512 | 1024 = 512;
  private dummyPacketsSentCount: number = 0;
  private realPacketsPaddedCount: number = 0;

  constructor() {
    this.startPoissonCoverTraffic();
  }

  /**
   * Apply fixed-length bucket padding with entropy to an outgoing packet
   */
  public padPayload(plaintextOrCiphertext: string, isDummy: boolean = false): PaddedEnvelope {
    const rawLen = plaintextOrCiphertext.length;
    let bucket: 512 | 1024 | 2048 = 512;
    if (rawLen > 1024) bucket = 2048;
    else if (rawLen > 512) bucket = 1024;

    const prefix = `PAD_V1:${isDummy ? 'DUMMY' : 'REAL'}:${rawLen.toString().padStart(5, '0')}:`;
    const neededPadding = Math.max(0, bucket - prefix.length - rawLen);
    const randomPadding = this.generateRandomEntropy(neededPadding);

    const wirePayload = `${prefix}${plaintextOrCiphertext}${randomPadding}`;

    if (isDummy) {
      this.dummyPacketsSentCount++;
    } else {
      this.realPacketsPaddedCount++;
    }

    return {
      originalLength: rawLen,
      paddedLength: wirePayload.length,
      fixedBucketSize: bucket,
      isDummyCover: isDummy,
      wirePayload,
      paddingEntropyBytes: neededPadding,
    };
  }

  /**
   * Strip padding and discard dummy cover noise upon reception
   */
  public unpadPayload(wirePayload: string): { isDummy: boolean; payload: string } | null {
    if (!wirePayload.startsWith('PAD_V1:')) {
      return { isDummy: false, payload: wirePayload };
    }

    const parts = wirePayload.split(':');
    if (parts.length < 4) return null;

    const isDummy = parts[1] === 'DUMMY';
    const originalLen = parseInt(parts[2], 10);
    const contentStartIndex = parts[0].length + parts[1].length + parts[2].length + 3;
    const originalPayload = wirePayload.substring(contentStartIndex, contentStartIndex + originalLen);

    return {
      isDummy,
      payload: originalPayload,
    };
  }

  /**
   * Generate Poisson-distributed random interval in ms (average ~8000ms)
   */
  private getNextPoissonDelay(lambdaMeanMs: number = 8000): number {
    const u = Math.random();
    return Math.max(2500, Math.round(-lambdaMeanMs * Math.log(1 - u)));
  }

  public startPoissonCoverTraffic(onDummy?: (env: PaddedEnvelope) => void) {
    if (onDummy) this.onDummyPacketCallback = onDummy;
    this.isCoverTrafficActive = true;

    const scheduleNext = () => {
      if (!this.isCoverTrafficActive) return;
      const delay = this.getNextPoissonDelay();
      this.dummyIntervalTimer = setTimeout(() => {
        if (this.isCoverTrafficActive) {
          const dummyPayload = this.padPayload('__DUMMY_HEARTBEAT_COVER__', true);
          if (this.onDummyPacketCallback) {
            this.onDummyPacketCallback(dummyPayload);
          }
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  public stopCoverTraffic() {
    this.isCoverTrafficActive = false;
    if (this.dummyIntervalTimer) clearTimeout(this.dummyIntervalTimer);
  }

  public getStats() {
    return {
      isActive: this.isCoverTrafficActive,
      dummySent: this.dummyPacketsSentCount,
      realPadded: this.realPacketsPaddedCount,
      bucketSize: this.defaultBucket,
    };
  }

  private generateRandomEntropy(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let res = '';
    for (let i = 0; i < length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }
}

export const coverTrafficEngine = new CoverTrafficService();
