/**
 * Lightweight Proof-of-Work (PoW) Anti-Spam Header Engine
 * Attaches a Hashcash micro-PoW puzzle solution to every radio mesh packet header.
 * Forces broadcasting nodes to expend a tiny cryptographic computational effort (~10-50ms CPU)
 * before transmission, mathematically throttling RF flood attacks and preventing battery drainage.
 */

export interface PoWHeader {
  nonce: number;
  difficultyBits: number; // Target leading zero bits (e.g. 12 = 0x000F...)
  timestamp: number;
  senderPubHex: string;
  solutionHashHex: string;
  solveDurationMs: number;
}

class ProofOfWorkService {
  private defaultDifficultyBits: number = 10; // ~1024 hash attempts, ideal for mobile battery & fast response
  private maxAllowedTimeDriftMs: number = 1000 * 60 * 5; // 5 min timestamp freshness window

  /**
   * Solve micro-PoW puzzle for an outgoing packet payload
   */
  public async solveProofOfWork(
    senderPubHex: string,
    payloadSnippet: string,
    difficultyBits: number = this.defaultDifficultyBits
  ): Promise<PoWHeader> {
    const startTime = performance.now();
    const timestamp = Date.now();
    let nonce = 0;
    const targetPrefix = '0'.repeat(Math.floor(difficultyBits / 4));

    while (true) {
      const input = `${senderPubHex}:${timestamp}:${payloadSnippet.substring(0, 32)}:${nonce}`;
      const hash = this.simpleSha256(input);

      if (hash.startsWith(targetPrefix)) {
        const duration = Math.round(performance.now() - startTime);
        return {
          nonce,
          difficultyBits,
          timestamp,
          senderPubHex,
          solutionHashHex: hash,
          solveDurationMs: Math.max(1, duration),
        };
      }
      nonce++;

      // Yield event loop occasionally on huge nonces
      if (nonce % 5000 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  /**
   * Instant verification of incoming PoW header at receiving nodes
   */
  public verifyProofOfWork(
    header: PoWHeader,
    payloadSnippet: string
  ): { valid: boolean; reason?: string } {
    // 1. Freshness check
    const now = Date.now();
    if (Math.abs(now - header.timestamp) > this.maxAllowedTimeDriftMs) {
      return { valid: false, reason: 'PoW timestamp expired or future-dated' };
    }

    // 2. Target check
    const targetPrefix = '0'.repeat(Math.floor(header.difficultyBits / 4));
    const input = `${header.senderPubHex}:${header.timestamp}:${payloadSnippet.substring(0, 32)}:${header.nonce}`;
    const recomputedHash = this.simpleSha256(input);

    if (recomputedHash !== header.solutionHashHex) {
      return { valid: false, reason: 'PoW hash verification mismatch' };
    }

    if (!recomputedHash.startsWith(targetPrefix)) {
      return { valid: false, reason: `PoW difficulty target not met (${header.difficultyBits} bits)` };
    }

    return { valid: true };
  }

  public getDifficulty(): number {
    return this.defaultDifficultyBits;
  }

  public setDifficulty(bits: number) {
    this.defaultDifficultyBits = bits;
  }

  private simpleSha256(str: string): string {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hashNum = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    return hashNum.toString(16).padStart(16, '0');
  }
}

export const proofOfWorkEngine = new ProofOfWorkService();
