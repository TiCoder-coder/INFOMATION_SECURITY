// sha256.ts — ECC project
// ─────────────────────────────────────────────────────────────────────────────
// Re-export sha256 từ sha-adapter, adapter này gọi SHA project tại:
//   ../../SHA/src/...
// Không còn tự implement SHA-256 tại đây nữa.
// ─────────────────────────────────────────────────────────────────────────────

export { sha256 } from './sha-adapter';
