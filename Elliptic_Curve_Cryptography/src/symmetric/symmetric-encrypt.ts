// Mã hóa đối xứng AES-256-CTR (bulk encryption trong ECIES).
// Không dùng node:crypto — dùng AES-256-CTR thuần TypeScript từ src/crypto.
import { aes256ctr } from '../crypto/ctr';
import { randomBytes } from '../crypto/random';

export interface SymmetricCiphertext {
  readonly iv: Buffer;
  readonly ct: Buffer;
}

export function symmetricEncrypt(EK: Buffer, M: Buffer): SymmetricCiphertext {
  if (EK.length !== 32) throw new Error('EK must be 32 bytes for AES-256-CTR');
  const iv = randomBytes(16);
  const ct = aes256ctr(EK, iv, M);
  return { iv: Buffer.from(iv), ct: Buffer.from(ct) };
}
