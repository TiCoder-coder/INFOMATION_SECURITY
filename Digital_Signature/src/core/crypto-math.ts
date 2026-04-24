import { CurvePoint, DomainParameters, pointToOctets } from '../ecc-proxy';
import { sha256 } from '../crypto/sha-adapter';
import { SchnorrLogger } from '../utils/schnorr-logger';

export function computeChallenge(
  R: CurvePoint,
  P: CurvePoint,
  message: Uint8Array,
  domain: DomainParameters,
  logger?: SchnorrLogger
): bigint {
  const fieldSizeBytes = 32; // secp256k1
  const rBytes = pointToOctets(R, fieldSizeBytes);
  const pBytes = pointToOctets(P, fieldSizeBytes);

  const concatBytes = new Uint8Array(rBytes.length + pBytes.length + message.length);
  concatBytes.set(rBytes, 0);
  concatBytes.set(pBytes, rBytes.length);
  concatBytes.set(message, rBytes.length + pBytes.length);

  const hashBytes = sha256(concatBytes);

  let eValue = 0n;
  for (let i = 0; i < hashBytes.length; i++) {
    eValue = (eValue << 8n) | BigInt(hashBytes[i]);
  }

  const e = eValue % domain.n;

  if (logger) {
    logger.stepLog('Tinh Toan Challenge (e)');
    logger.buf('Thong diep (m)', message);
    logger.buf('Diem R (Uncompressed)', rBytes);
    logger.buf('Khoa (P) (Uncompressed)', pBytes);
    logger.buf('Ghep (R || P || m)', concatBytes);
    logger.buf('Hash SHA-256 (H)', hashBytes);
    logger.hex('Gia tri (e) sau module', e);
  }

  return e;
}
