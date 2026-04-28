import type { EciesConfig } from '../ecies/config/ecies-config';
import { getEnv } from './get-env';

export function loadEciesConfigFromEnv(): EciesConfig {
  const hash = getEnv('ECIES_KDF_HASH') as EciesConfig['kdfHash'];
  if (!['sha256', 'sha384', 'sha512'].includes(hash)) {
    throw new Error(`Invalid ECIES_KDF_HASH: ${hash}`);
  }
  return {
    encKeyLen: Number(getEnv('ECIES_ENC_KEY_LEN')),
    macKeyLen: Number(getEnv('ECIES_MAC_KEY_LEN')),
    kdfHash: hash,
  };
}
