import type { PrivateKey } from '../../keys/types/key-types';
import type { Ciphertext } from '../types/ciphertext';
import type { DomainParameters } from '../../domain/types/domain-parameters';
import { DEFAULT_ECIES_CONFIG, type EciesConfig } from '../config/ecies-config';
import { validatePublicPoint } from '../../curve/validate-public-point';
import { computeSharedSecret } from '../../ecdh/compute-shared-secret';
import { deriveEncryptionKeys } from '../shared/derive-encryption-keys';
import { verifyMac } from '../../mac/verify-mac';
import { symmetricDecrypt } from '../../symmetric/symmetric-decrypt';

export function eciesDecrypt(
  C: Ciphertext,
  dV: PrivateKey,
  T: DomainParameters,
  cfg: EciesConfig = DEFAULT_ECIES_CONFIG,
): Buffer {
  
  if (!validatePublicPoint(C.R, T)) {
    throw new Error('Không hợp lệ: ephemeral point R không hợp lệ');
  }
  
  const z = computeSharedSecret(dV, C.R, T);

  const { EK, MK } = deriveEncryptionKeys(z, T, cfg);
  
  if (!verifyMac(MK, C.EM, C.TAG)) {
    throw new Error('Không hợp lệ: TAG kiểm tra thất bại');
  }
  
  const iv = C.EM.subarray(0, 16);
  const ct = C.EM.subarray(16);
  return symmetricDecrypt(EK, iv, ct);
}
