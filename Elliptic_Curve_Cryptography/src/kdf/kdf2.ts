import { sha256 }         from '../crypto/sha256';
import { sha384, sha512 } from '../crypto/sha512';

type HashAlg = 'sha256' | 'sha384' | 'sha512';

const HASH_LEN: Record<HashAlg, number> = { sha256: 32, sha384: 48, sha512: 64 };

function hashFn(alg: HashAlg, data: Uint8Array): Uint8Array {
  switch (alg) {
    case 'sha256': return sha256(data);
    case 'sha384': return sha384(data);
    case 'sha512': return sha512(data);
  }
}

export function kdf2(
  Z: Buffer,
  keyLen: number,
  hashAlg: HashAlg = 'sha256',
  sharedInfo: Buffer = Buffer.alloc(0),
): Buffer {
  const hashLen  = HASH_LEN[hashAlg];
  const iterations = Math.ceil(keyLen / hashLen);
  if (iterations > 0xffffffff) throw new Error('keyLen too large for KDF2');

  const chunks: Uint8Array[] = [];
  for (let counter = 1; counter <= iterations; counter++) {
    
    const input = new Uint8Array(Z.length + 4 + sharedInfo.length);
    input.set(Z);
    const ctrView = new DataView(input.buffer, Z.length, 4);
    ctrView.setUint32(0, counter, false);
    input.set(sharedInfo, Z.length + 4);
    chunks.push(hashFn(hashAlg, input));
  }
  
  const total = new Uint8Array(hashLen * iterations);
  let off = 0;
  for (const c of chunks) { total.set(c, off); off += c.length; }
  return Buffer.from(total.subarray(0, keyLen));
}
