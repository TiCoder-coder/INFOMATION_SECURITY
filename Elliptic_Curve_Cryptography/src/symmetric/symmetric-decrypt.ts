import { aes256ctr } from '../crypto/ctr';

export function symmetricDecrypt(EK: Buffer, iv: Buffer, ct: Buffer): Buffer {
  if (EK.length !== 32) throw new Error('EK must be 32 bytes for AES-256-CTR');
  if (iv.length !== 16)  throw new Error('IV must be 16 bytes');
  return Buffer.from(aes256ctr(EK, iv, ct));
}
