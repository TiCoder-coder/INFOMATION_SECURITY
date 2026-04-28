import { randomBytes } from '../crypto/random';

export function generateRandomScalar(n: bigint): bigint {
  const byteLength = Math.ceil(n.toString(16).length / 2);
  while (true) {
    const buf = randomBytes(byteLength);
    let candidate = 0n;
    for (const byte of buf) candidate = (candidate << 8n) | BigInt(byte);
    if (candidate >= 1n && candidate <= n - 1n) return candidate;
  }
}
