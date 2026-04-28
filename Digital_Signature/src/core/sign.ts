import { DomainParameters, scalarMultiply, generateRandomScalar } from '../ecc-proxy';
import { SchnorrSignature } from './types';
import { computeChallenge } from './crypto-math';
import { SchnorrLogger } from '../utils/schnorr-logger';

export function schnorrSign(
  message: Uint8Array,
  privateKey: bigint,
  domain: DomainParameters,
  logger?: SchnorrLogger
): SchnorrSignature {
  if (logger) logger.section('TIEN HANH CHU KY SCHNORR');

  
  const k = generateRandomScalar(domain.n);
  if (logger) {
    logger.stepLog('Sinh nonce ngau nhien (k)');
    logger.hex('Gia tri k', k);
  }
  
  
  const R = scalarMultiply(k, domain.G, domain);
  if (logger && !R.infinity) {
    logger.stepLog('Tinh Toan Diem Tạm Thoi (R = k * G)');
    logger.hex('R.x', R.x);
    logger.hex('R.y', R.y);
  }
  
  
  const P = scalarMultiply(privateKey, domain.G, domain);

  
  const e = computeChallenge(R, P, message, domain, logger);

  
  let s = (k + e * privateKey) % domain.n;
  if (logger) {
    logger.stepLog('Tinh Toan Dai Luong Chu Ky (s = k + e * d mod n)');
    logger.hex('Gia tri s', s);
  }
  
  return { R, s };
}
