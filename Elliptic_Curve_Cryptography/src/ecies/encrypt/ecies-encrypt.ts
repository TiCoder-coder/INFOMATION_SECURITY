// Thuật toán ECC_Encrypt(M, QV) — ECIES theo SEC 1 §5.1.3.
//   1. (k, R) ← sinh ephemeral key pair, R = k·G
//   2. z ← k · QV  (shared secret)
//   3. Z ← FieldElementToOctets(z)
//   4. K ← KDF(Z)
//   5. EK || MK ← K
//   6. EM ← SymEnc(EK, M)
//   7. TAG ← MAC(MK, EM)
//   8. C = (R, EM, TAG)
import type { PublicKey } from '../../keys/types/key-types';
import type { Ciphertext } from '../types/ciphertext';
import { DEFAULT_ECIES_CONFIG, type EciesConfig } from '../config/ecies-config';
import { validatePublicPoint } from '../../curve/validate-public-point';
import { generateEphemeralKeyPair } from './generate-ephemeral';
import { computeSharedSecret } from '../../ecdh/compute-shared-secret';
import { deriveEncryptionKeys } from '../shared/derive-encryption-keys';
import { symmetricEncrypt } from '../../symmetric/symmetric-encrypt';
import { computeMac } from '../../mac/compute-mac';

export function eciesEncrypt(
  M: Buffer,
  receiverPub: PublicKey,
  cfg: EciesConfig = DEFAULT_ECIES_CONFIG,
): Ciphertext {
  const T = receiverPub.params;

  // Bước 0: Validate QV để tránh invalid-curve attack.
  if (!validatePublicPoint(receiverPub.Q, T)) {
    throw new Error('Invalid receiver public key QV');
  }

  // Bước 1: ephemeral (k, R)
  const { privateKey: k, publicKey: R } = generateEphemeralKeyPair(T);

  // Bước 2: z = k · QV
  const z = computeSharedSecret(k, receiverPub.Q, T);

  // Bước 3–5: Z → KDF → (EK, MK)
  const { EK, MK } = deriveEncryptionKeys(z, T, cfg);

  // Bước 6: EM = Enc(EK, M)
  const { iv, ct } = symmetricEncrypt(EK, M);
  const EM = Buffer.concat([iv, ct]);

  // Bước 7: TAG = MAC(MK, EM)
  const TAG = computeMac(MK, EM);

  // Bước 8: C = (R, EM, TAG)
  return { R: R.Q, EM, TAG };
}
