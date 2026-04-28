import { DomainParameters, CurvePoint, scalarMultiply, generateRandomScalar } from '../ecc-proxy';
import { SchnorrKeyPair } from './types';

export function generateSchnorrKeyPair(domain: DomainParameters): SchnorrKeyPair {
  
  const d = generateRandomScalar(domain.n);
  
  
  const P = scalarMultiply(d, domain.G, domain);

  return {
    privateKey: d,
    publicKey: P
  };
}
