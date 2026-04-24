/**
 * sha256.ts
 * -----------------------------------------------------------
 * Re-export sha256 từ sha-adapter, adapter này trỏ tới hàm lõi
 * của SHA project (sibling directory).
 * KHÔNG còn tự implement thủ công tại ECDH nữa.
 * -----------------------------------------------------------
 */

export { sha256 } from "./sha-adapter.ts";

export const SHA256_BLOCK_SIZE = 64;
export const SHA256_OUTPUT_SIZE = 32;
