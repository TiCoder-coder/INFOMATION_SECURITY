// Sinh ephemeral key pair (k, R) cho ECIES — Bước 1 của ECC_Encrypt.
import type { DomainParameters } from '../../domain/types/domain-parameters';
import type { KeyPair } from '../../keys/types/key-types';
import { generateKeyPair } from '../../keys/generate-key-pair';

export function generateEphemeralKeyPair(params: DomainParameters): KeyPair {
  return generateKeyPair(params);
}
