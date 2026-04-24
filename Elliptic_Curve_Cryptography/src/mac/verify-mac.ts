// Verify TAG theo constant-time.
// Không dùng node:crypto.timingSafeEqual — tự implement so sánh constant-time.
import { computeMac } from './compute-mac';

/** So sánh hai Uint8Array theo constant-time (không short-circuit). */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function verifyMac(MK: Buffer, data: Buffer, tag: Buffer): boolean {
  const expected = computeMac(MK, data);
  return constantTimeEqual(expected, tag);
}
