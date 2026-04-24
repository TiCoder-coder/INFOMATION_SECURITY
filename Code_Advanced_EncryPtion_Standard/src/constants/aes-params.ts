// Các hằng số cơ bản của AES (FIPS 197)
// Block size luôn = 128 bits = 16 bytes với mọi biến thể AES
export const BLOCK_SIZE_BYTES = 16;

// Số cột của State matrix (Nb) — luôn = 4 theo chuẩn AES
export const NB = 4;

// Số hàng của State matrix — luôn = 4
export const STATE_ROWS = 4;

// Số byte mỗi word
export const BYTES_PER_WORD = 4;
