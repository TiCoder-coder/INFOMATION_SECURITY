import { sha256, SHA256_BLOCK_SIZE, SHA256_OUTPUT_SIZE } from "./sha256.ts";

const IPAD = 0x36;
const OPAD = 0x5c;

export function hmacSha256(key: Buffer, message: Buffer): Buffer {
  
  let K: Buffer;
  if (key.length > SHA256_BLOCK_SIZE) {
    K = sha256(key); 
  } else {
    K = key;
  }
  if (K.length < SHA256_BLOCK_SIZE) {
    const pad = Buffer.alloc(SHA256_BLOCK_SIZE - K.length, 0x00);
    K = Buffer.concat([K, pad]);
  }

  const iKeyPad = Buffer.alloc(SHA256_BLOCK_SIZE);
  const oKeyPad = Buffer.alloc(SHA256_BLOCK_SIZE);
  for (let i = 0; i < SHA256_BLOCK_SIZE; i++) {
    iKeyPad[i] = K[i] ^ IPAD;
    oKeyPad[i] = K[i] ^ OPAD;
  }
  
  const inner = sha256(Buffer.concat([iKeyPad, message]));
  const mac = sha256(Buffer.concat([oKeyPad, inner]));
  return mac;
}

export const HMAC_SHA256_OUTPUT = SHA256_OUTPUT_SIZE;
