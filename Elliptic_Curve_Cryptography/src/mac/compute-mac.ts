// Tính thẻ TAG = HMAC-SHA256(MK, data).
// Không dùng node:crypto — dùng HMAC thuần TypeScript từ src/crypto.
import { hmacSha256 } from '../crypto/hmac';

export function computeMac(MK: Buffer, data: Buffer): Buffer {
  return Buffer.from(hmacSha256(MK, data));
}
