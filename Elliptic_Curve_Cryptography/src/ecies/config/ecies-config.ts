// Tham số cấu hình cho ECIES.
export interface EciesConfig {
  /** Độ dài khóa mã hóa đối xứng (byte). Mặc định 32 cho AES-256. */
  readonly encKeyLen: number;
  /** Độ dài khóa MAC (byte). Mặc định 32 cho HMAC-SHA256. */
  readonly macKeyLen: number;
  /** Hash function cho KDF. */
  readonly kdfHash: 'sha256' | 'sha384' | 'sha512';
}

export const DEFAULT_ECIES_CONFIG: EciesConfig = {
  encKeyLen: 32,
  macKeyLen: 32,
  kdfHash: 'sha256',
};
