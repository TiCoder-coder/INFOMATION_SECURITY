import { AESConfig, AESKeySize } from '../types';

const CONFIG_MAP: Record<AESKeySize, AESConfig> = {
  128: { keySize: 128, Nk: 4, Nb: 4, Nr: 10 },
  192: { keySize: 192, Nk: 6, Nb: 4, Nr: 12 },
  256: { keySize: 256, Nk: 8, Nb: 4, Nr: 14 },
};

export function getAESConfig(keySize: AESKeySize): AESConfig {
  const cfg = CONFIG_MAP[keySize];
  if (!cfg) {
    throw new Error(
      `Invalid AES key size: ${keySize}. Phải là 128, 192 hoặc 256.`
    );
  }
  return cfg;
}

export function isValidAESKeySize(value: unknown): value is AESKeySize {
  return value === 128 || value === 192 || value === 256;
}
