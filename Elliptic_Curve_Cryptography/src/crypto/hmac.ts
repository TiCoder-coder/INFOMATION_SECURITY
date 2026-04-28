import { sha256 }         from './sha256';
import { sha384, sha512 } from './sha512';

export type HashAlg = 'sha256' | 'sha384' | 'sha512';

const HASH_PARAMS: Record<HashAlg, { blockLen: number; digestLen: number }> = {
  sha256: { blockLen: 64,  digestLen: 32 },
  sha384: { blockLen: 128, digestLen: 48 },
  sha512: { blockLen: 128, digestLen: 64 },
};

function hashFunc(alg: HashAlg, data: Uint8Array): Uint8Array {
  switch (alg) {
    case 'sha256': return sha256(data);
    case 'sha384': return sha384(data);
    case 'sha512': return sha512(data);
  }
}

export function hmac(alg: HashAlg, key: Uint8Array, data: Uint8Array): Uint8Array {
  const { blockLen } = HASH_PARAMS[alg];

  
  let k = key.length > blockLen ? hashFunc(alg, key) : key;

  
  const kPad = new Uint8Array(blockLen);
  kPad.set(k);

  
  const ipad = new Uint8Array(blockLen + data.length);
  const opadData = new Uint8Array(blockLen + HASH_PARAMS[alg].digestLen);

  for (let i = 0; i < blockLen; i++) {
    ipad[i]     = kPad[i] ^ 0x36;
    opadData[i] = kPad[i] ^ 0x5c;
  }
  ipad.set(data, blockLen);

  
  const inner = hashFunc(alg, ipad);

  
  opadData.set(inner, blockLen);
  return hashFunc(alg, opadData);
}

export function hmacSha256(key: Uint8Array, data: Uint8Array): Uint8Array {
  return hmac('sha256', key, data);
}
