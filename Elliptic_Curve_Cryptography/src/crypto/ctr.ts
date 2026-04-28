import { aes256KeyExpand, aes256EncryptBlock } from './aes256';

function incrementCtr(ctr: Uint8Array): void {
  for (let i = 15; i >= 0; i--) {
    ctr[i] = (ctr[i] + 1) & 0xff;
    if (ctr[i] !== 0) break;
  }
}

export function aes256ctr(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
  if (key.length !== 32) throw new Error('AES-256-CTR requires 32-byte key');
  if (iv.length !== 16)  throw new Error('AES-256-CTR requires 16-byte IV');

  const roundKeys = aes256KeyExpand(key);
  const ctr = new Uint8Array(iv);           
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
