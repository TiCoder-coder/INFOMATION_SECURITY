/**
 * hmac.ts
 * -----------------------------------------------------------
 * HMAC-SHA256 cài thủ công theo RFC 2104.
 *
 *   HMAC(K,m) = H( (K' XOR opad) || H( (K' XOR ipad) || m ) )
 * -----------------------------------------------------------
 */

import { sha256, SHA256_BLOCK_SIZE, SHA256_OUTPUT_SIZE } from "./sha256.ts";

const IPAD = 0x36;
const OPAD = 0x5c;

export function hmacSha256(key: Buffer, message: Buffer): Buffer {
  // 1) Chuẩn hoá khoá về đúng block size
  let K: Buffer;
  if (key.length > SHA256_BLOCK_SIZE) {
    K = sha256(key); // 32 byte
  } else {
    K = key;
  }
  if (K.length < SHA256_BLOCK_SIZE) {
    const pad = Buffer.alloc(SHA256_BLOCK_SIZE - K.length, 0x00);
    K = Buffer.concat([K, pad]);
  }

  // 2) Tạo inner/outer pad
  const iKeyPad = Buffer.alloc(SHA256_BLOCK_SIZE);
  const oKeyPad = Buffer.alloc(SHA256_BLOCK_SIZE);
  for (let i = 0; i < SHA256_BLOCK_SIZE; i++) {
    iKeyPad[i] = K[i] ^ IPAD;
    oKeyPad[i] = K[i] ^ OPAD;
  }

  // 3) H(oKeyPad || H(iKeyPad || message))
  const inner = sha256(Buffer.concat([iKeyPad, message]));
  const mac = sha256(Buffer.concat([oKeyPad, inner]));
  return mac;
}

export const HMAC_SHA256_OUTPUT = SHA256_OUTPUT_SIZE;
