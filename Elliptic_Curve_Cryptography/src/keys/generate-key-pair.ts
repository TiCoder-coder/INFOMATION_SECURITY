import type { DomainParameters } from '../domain/types/domain-parameters';
import type { KeyPair } from './types/key-types';
import { generateRandomScalar } from './generate-random-scalar';
import { derivePublicKey } from './derive-public-key';

export function generateKeyPair(params: DomainParameters): KeyPair {
  const d = generateRandomScalar(params.n);
  const Q = derivePublicKey(d, params);
  return {
    privateKey: d,
    publicKey: { Q, params },
  };
}
