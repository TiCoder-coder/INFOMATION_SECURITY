// HMAC thuần TypeScript — RFC 2104.
// Không dùng bất kỳ thư viện bên ngoài nào.

import { sha256 }         from './sha256';
import { sha384, sha512 } from './sha512';

export type HashAlg = 'sha256' | 'sha384' | 'sha512';

/** Kích thước block và digest của mỗi hash function (byte). */
const HASH_PARAMS: Record<HashAlg, { blockLen: number; digestLen: number }> = {
  sha256: { blockLen: 64,  digestLen: 32 },
  sha384: { blockLen: 128, digestLen: 48 },
  sha512: { blockLen: 128, digestLen: 64 },
};

/** Hàm hash cụ thể. */
function hashFunc(alg: HashAlg, data: Uint8Array): Uint8Array {
  switch (alg) {
    case 'sha256': return sha256(data);
    case 'sha384': return sha384(data);
    case 'sha512': return sha512(data);
  }
}

/**
 * HMAC(key, data) theo RFC 2104.
 * HMAC(K, m) = Hash( (K ⊕ opad) ‖ Hash( (K ⊕ ipad) ‖ m ) )
 *
 * @param alg   'sha256' | 'sha384' | 'sha512'
 * @param key   Khóa MAC (bất kỳ độ dài).
 * @param data  Dữ liệu cần xác thực.
 * @returns     HMAC digest (Uint8Array).
 */
export function hmac(alg: HashAlg, key: Uint8Array, data: Uint8Array): Uint8Array {
  const { blockLen } = HASH_PARAMS[alg];

  // Nếu key dài hơn blockLen, hash nó trước.
  let k = key.length > blockLen ? hashFunc(alg, key) : key;

  // Pad key lên đúng blockLen byte.
  const kPad = new Uint8Array(blockLen);
  kPad.set(k);

  // ipad = 0x36 × blockLen,  opad = 0x5c × blockLen.
  const ipad = new Uint8Array(blockLen + data.length);
  const opadData = new Uint8Array(blockLen + HASH_PARAMS[alg].digestLen);

  for (let i = 0; i < blockLen; i++) {
    ipad[i]     = kPad[i] ^ 0x36;
    opadData[i] = kPad[i] ^ 0x5c;
  }
  ipad.set(data, blockLen);

  // Hash bên trong: inner = Hash(ipad ‖ data)
  const inner = hashFunc(alg, ipad);

  // Hash bên ngoài: HMAC = Hash(opad ‖ inner)
  opadData.set(inner, blockLen);
  return hashFunc(alg, opadData);
}

/**
 * HMAC-SHA256 — shorthand.
 */
export function hmacSha256(key: Uint8Array, data: Uint8Array): Uint8Array {
  return hmac('sha256', key, data);
}
