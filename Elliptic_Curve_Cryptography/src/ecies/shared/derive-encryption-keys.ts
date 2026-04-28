import { fieldElementToOctets } from '../../encoding/field-element-to-octets';
import { fieldSizeBytes } from '../../encoding/field-size';
import { kdf2 } from '../../kdf/kdf2';
import { splitKeys, type SplitKeys } from '../../kdf/split-keys';
import type { EciesConfig } from '../config/ecies-config';
import type { DomainParameters } from '../../domain/types/domain-parameters';

export function deriveEncryptionKeys(
  z: bigint,
  T: DomainParameters,
  cfg: EciesConfig,
): SplitKeys {
  const Z = fieldElementToOctets(z, fieldSizeBytes(T.p));
  const K = kdf2(Z, cfg.encKeyLen + cfg.macKeyLen, cfg.kdfHash);
  return splitKeys(K, cfg.encKeyLen, cfg.macKeyLen);
}
