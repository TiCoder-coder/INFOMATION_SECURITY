// Thuật toán ECC_Decrypt(C, dV) — ECIES theo SEC 1 §5.1.4.
//   1. z ← dV · R
//   2. Z ← FieldElementToOctets(z)
//   3. K ← KDF(Z)
//   4. EK || MK ← K
//   5. Verify TAG bằng MK; nếu sai → "không hợp lệ"
//   6. M ← SymDec(EK, EM)
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
  // Bước 0: validate R
  if (!validatePublicPoint(C.R, T)) {
    throw new Error('Không hợp lệ: ephemeral point R không hợp lệ');
  }

  // Bước 1: z = dV · R
  const z = computeSharedSecret(dV, C.R, T);

  // Bước 2–4: KDF → EK, MK
  const { EK, MK } = deriveEncryptionKeys(z, T, cfg);

  // Bước 5: verify TAG
  if (!verifyMac(MK, C.EM, C.TAG)) {
    throw new Error('Không hợp lệ: TAG kiểm tra thất bại');
  }

  // Bước 6: giải mã EM
  const iv = C.EM.subarray(0, 16);
  const ct = C.EM.subarray(16);
  return symmetricDecrypt(EK, iv, ct);
}
