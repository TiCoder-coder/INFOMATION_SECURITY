//Constants sử dụng trong SHA3-256, SHA3-384, SHA3-512
/**
 * Keccak Round Constants (ι)
 * 24 hằng số được sử dụng trong 24 vòng của Keccak-f[1600]
 */
export const KECCAK_ROUND_CONSTANTS = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an,
  0x8000000080008000n, 0x000000000000808bn, 0x0000000080000001n,
  0x8000000080008081n, 0x8000000000008009n, 0x000000000000008an,
  0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n,
  0x8000000000008003n, 0x8000000000008002n, 0x8000000000000080n,
  0x000000000000800an, 0x800000008000000an, 0x8000000080008081n,
  0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

/**
 * Keccak Rotation Offsets
 * Offset cho rotation trong theta step
 */
export const KECCAK_ROTATION_OFFSETS: number[][] = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14],
];

/**
 * SHA-3 Domain Separation Bytes
 * Các byte phân biệt giữa SHA-3 và các ứng dụng Keccak khác
 */
export const SHA3_DOMAIN_SEPARATION = {
  SHA3_256: 0x06,   // SHA3-256
  SHA3_384: 0x06,   // SHA3-384
  SHA3_512: 0x06,   // SHA3-512
  SHAKE128: 0x1f,   // SHAKE128
  SHAKE256: 0x1f,   // SHAKE256
};

/**
 * SHA-3 Configuration
 */
export const SHA3_CONFIG = {
  SHA3_256: {
    blockSize: 1088,    // Rate (r) = 1088 bits = 136 bytes
    capacity: 512,      // Capacity (c) = 512 bits
    outputSize: 256,    // Output size = 256 bits
    rounds: 24,         // Keccak-f[1600] có 24 vòng
    domainSeparation: 0x06,
  },
  SHA3_384: {
    blockSize: 832,     // Rate (r) = 832 bits = 104 bytes
    capacity: 768,      // Capacity (c) = 768 bits
    outputSize: 384,    // Output size = 384 bits
    rounds: 24,
    domainSeparation: 0x06,
  },
  SHA3_512: {
    blockSize: 576,     // Rate (r) = 576 bits = 72 bytes
    capacity: 1024,     // Capacity (c) = 1024 bits
    outputSize: 512,    // Output size = 512 bits
    rounds: 24,
    domainSeparation: 0x06,
  },
};

/**
 * Keccak-f[1600] State Size
 * Keccak-f[1600] hoạt động trên trạng thái 1600 bits (5x5x64)
 */
export const KECCAK_STATE_SIZE = {
  width: 1600,      // Tổng số bit
  x: 5,             // Chiều x (5 lanes)
  y: 5,             // Chiều y (5 lanes)
  z: 64,            // Chiều z (64 bits per lane)
  laneSize: 64,     // Kích thước một lane = 64 bits = 8 bytes
};
