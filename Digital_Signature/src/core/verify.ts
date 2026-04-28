import { DomainParameters, CurvePoint, scalarMultiply, pointAdd } from '../ecc-proxy';
import { SchnorrSignature } from './types';
import { computeChallenge } from './crypto-math';
import { SchnorrLogger } from '../utils/schnorr-logger';

export function schnorrVerify(
  message: Uint8Array,
  signature: SchnorrSignature,
  publicKey: CurvePoint,
  domain: DomainParameters,
  logger?: SchnorrLogger
): boolean {
  if (logger) logger.section('XAC MINH CHU KY SCHNORR');

  const { R, s } = signature;
  if (logger) {
    logger.stepLog('Trích xuat Sig = (R, s)');
    logger.hex('Gia tri s', s);
  }

  
  if (logger) logger.stepLog('Tinh Toan Lai e = H(R || P || m)');
  const e = computeChallenge(R, publicKey, message, domain, logger);

  
  const L = scalarMultiply(s, domain.G, domain);
  if (logger) {
    logger.stepLog('Tinh Ve Trai (L = s * G)', 'Diem L (X, Y)');
    if (!L.infinity) {
      logger.hex('L.x', L.x);
      logger.hex('L.y', L.y);
    } else {
      logger.kv('L', 'Infinity');
    }
  }

  
  const eP = scalarMultiply(e, publicKey, domain);
  if (logger) {
    logger.stepLog('Tinh Giao (e * P)');
    if (!eP.infinity) {
      logger.hex('eP.x', eP.x);
      logger.hex('eP.y', eP.y);
    }
  }

  const V = pointAdd(R, eP, domain);
  if (logger) {
    logger.stepLog('Tinh Ve Phai (V = R + e * P)', 'Diem V (X, Y)');
    if (!V.infinity) {
      logger.hex('V.x', V.x);
      logger.hex('V.y', V.y);
    } else {
      logger.kv('V', 'Infinity');
    }
  }

  
  let isValid = false;
  if (L.infinity || V.infinity) {
    isValid = L.infinity === V.infinity;
  } else {
    isValid = L.x === V.x && L.y === V.y;
  }

  if (logger) {
    logger.stepLog('So Sanh (L == V)');
    logger.kv('Ket qua so sanh', isValid ? 'HOP LE' : 'KHONG HOP LE');
  }

  return isValid;
}
