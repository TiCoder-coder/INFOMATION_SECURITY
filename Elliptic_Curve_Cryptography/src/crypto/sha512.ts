// sha512.ts — ECC project
// ─────────────────────────────────────────────────────────────────────────────
// Re-export sha512 và sha384 từ sha-adapter, adapter này gọi SHA project tại:
//   ../../SHA/src/...
// Không còn tự implement SHA-512/SHA-384 tại đây nữa.
// ─────────────────────────────────────────────────────────────────────────────

export { sha512, sha384 } from './sha-adapter';
