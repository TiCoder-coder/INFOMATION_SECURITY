import { DomainParameters, CurvePoint, scalarMultiply, generateRandomScalar } from '../ecc-proxy';
import { SchnorrKeyPair } from './types';

/**
 * Sinh khóa Schnorr
 * B1: Chọn ngẫu nhiên d (1 <= d <= n - 1)
 * B2: Tính P = d * G
 * 
 * @param domain Bộ tham số đường cong (ví dụ secp256k1)
 * @returns SchnorrKeyPair chứa d và P
 */
export function generateSchnorrKeyPair(domain: DomainParameters): SchnorrKeyPair {
  // Sinh số d ngẫu nhiên trong khoảng [1, n-1]
  const d = generateRandomScalar(domain.n);
  
  // Tính P = d * G
  const P = scalarMultiply(d, domain.G, domain);

  return {
    privateKey: d,
    publicKey: P
  };
}
