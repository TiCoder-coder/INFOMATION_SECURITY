// Sinh ngẫu nhiên số nguyên d sao cho 1 ≤ d ≤ n − 1 (SEC 1 §3.2.1).
// Không dùng node:crypto — dùng CSPRNG thuần TypeScript từ src/crypto.
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
