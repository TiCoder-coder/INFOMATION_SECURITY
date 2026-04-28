export interface EciesConfig {
  readonly encKeyLen: number;
  readonly macKeyLen: number;
  readonly kdfHash: 'sha256' | 'sha384' | 'sha512';
}

export const DEFAULT_ECIES_CONFIG: EciesConfig = {
  encKeyLen: 32,
  macKeyLen: 32,
  kdfHash: 'sha256',
};
