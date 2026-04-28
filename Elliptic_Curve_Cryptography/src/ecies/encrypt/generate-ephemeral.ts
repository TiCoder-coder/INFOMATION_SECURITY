import type { DomainParameters } from '../../domain/types/domain-parameters';
import type { KeyPair } from '../../keys/types/key-types';
import { generateKeyPair } from '../../keys/generate-key-pair';

export function generateEphemeralKeyPair(params: DomainParameters): KeyPair {
  return generateKeyPair(params);
}
