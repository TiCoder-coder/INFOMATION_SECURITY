// AES-256-CTR mode thuần TypeScript.
// CTR mode: mỗi khối i → Encrypt(IV + i) → XOR với plaintext/ciphertext.
// Mã hóa và giải mã GIỐNG NHAU (symmetric keystream).

import { aes256KeyExpand, aes256EncryptBlock } from './aes256';

/**
 * Tăng bộ đếm 128-bit big-endian (in-place).
 */
function incrementCtr(ctr: Uint8Array): void {
  for (let i = 15; i >= 0; i--) {
    ctr[i] = (ctr[i] + 1) & 0xff;
    if (ctr[i] !== 0) break;
  }
}

/**
 * AES-256-CTR: mã hóa hoặc giải mã (phép toán giống nhau).
 * Tương thích với Node.js `createCipheriv('aes-256-ctr', key, iv)`.
 *
 * @param key   32-byte AES-256 key.
 * @param iv    16-byte IV / nonce (dùng làm counter khởi đầu, big-endian increment).
 * @param data  Plaintext hoặc ciphertext.
 * @returns     Uint8Array cùng độ dài với data.
 */
export function aes256ctr(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
  if (key.length !== 32) throw new Error('AES-256-CTR requires 32-byte key');
  if (iv.length !== 16)  throw new Error('AES-256-CTR requires 16-byte IV');

  const roundKeys = aes256KeyExpand(key);
  const ctr = new Uint8Array(iv);           // bản sao IV làm counter
  const result = new Uint8Array(data.length);

  let pos = 0;
  while (pos < data.length) {
    const keystream = aes256EncryptBlock(roundKeys, ctr);
    const blockLen  = Math.min(16, data.length - pos);
    for (let i = 0; i < blockLen; i++) {
      result[pos + i] = data[pos + i] ^ keystream[i];
    }
    incrementCtr(ctr);
    pos += blockLen;
  }

  return result;
}
