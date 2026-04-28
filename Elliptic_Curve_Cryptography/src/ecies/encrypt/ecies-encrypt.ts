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
  
  if (!validatePublicPoint(receiverPub.Q, T)) {
    throw new Error('Invalid receiver public key QV');
  }

  const { privateKey: k, publicKey: R } = generateEphemeralKeyPair(T);
  const z = computeSharedSecret(k, receiverPub.Q, T);
  const { EK, MK } = deriveEncryptionKeys(z, T, cfg);
  const { iv, ct } = symmetricEncrypt(EK, M);
  const EM = Buffer.concat([iv, ct]);
  const TAG = computeMac(MK, EM);

  return { R: R.Q, EM, TAG };
}
