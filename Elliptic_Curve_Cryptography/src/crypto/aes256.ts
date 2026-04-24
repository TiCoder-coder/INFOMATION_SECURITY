// AES-256 block cipher thuần TypeScript — FIPS 197.
// Chỉ implement chiều mã hóa (encrypt) vì CTR mode không cần decrypt block.
// S-box được sinh tự động từ GF(2^8) để tránh lỗi sao chép bảng tĩnh.

// ─── GF(2^8) arithmetic với đa thức bất khả quy AES: x^8+x^4+x^3+x+1 ───────

/** Nhân hai phần tử trong GF(2^8). */
function gfMul(a: number, b: number): number {
  let result = 0;
  let aa = a & 0xff;
  let bb = b & 0xff;
  while (bb > 0) {
    if (bb & 1) result ^= aa;
    const hi = aa & 0x80;
    aa = (aa << 1) & 0xff;
    if (hi) aa ^= 0x1b; // reduce mod x^8+x^4+x^3+x+1
    bb >>>= 1;
  }
  return result;
}

/** Nghịch đảo nhân trong GF(2^8): a^{-1} = a^{254} (Fermat), 0 → 0. */
function gfInv(a: number): number {
  if (a === 0) return 0;
  let r = 1;
  let base = a;
  let exp = 254;
  while (exp > 0) {
    if (exp & 1) r = gfMul(r, base);
    base = gfMul(base, base);
    exp >>>= 1;
  }
  return r;
}

/** Ánh xạ affine AES cho SubBytes: xoay bit trái + XOR 0x63. */
function affineTx(x: number): number {
  let b = x & 0xff;
  let s = b;
  for (let i = 0; i < 4; i++) {
    b = ((b << 1) | (b >>> 7)) & 0xff;
    s ^= b;
  }
  return (s ^ 0x63) & 0xff;
}

// ─── Xây dựng S-box lúc module load ─────────────────────────────────────────

const SBOX = new Uint8Array(256);
(function buildSBox() {
  for (let i = 0; i < 256; i++) {
    SBOX[i] = affineTx(gfInv(i));
  }
})();

// ─── Round constants cho key expansion ──────────────────────────────────────

// RCON[i] = [x^{i-1} in GF(2^8), 0, 0, 0]; i bắt đầu từ 1.
// AES-256 dùng tối đa RCON[7] (vòng i = 8, 16, 24, 32, 40, 48, 56 — tức i/8 = 1..7).
const RCON = new Uint8Array(8);
(function buildRcon() {
  RCON[1] = 0x01;
  for (let i = 2; i <= 7; i++) RCON[i] = gfMul(RCON[i - 1], 2);
})();

// ─── Key Expansion cho AES-256 ───────────────────────────────────────────────

/**
 * Sinh 15 round key (240 byte) từ khóa 256-bit (32 byte).
 * @param key  32 byte key.
 * @returns    240-byte Uint8Array (60 words × 4 byte).
 */
export function aes256KeyExpand(key: Uint8Array): Uint8Array {
  if (key.length !== 32) throw new Error('AES-256 requires 32-byte key');
  const W = new Uint8Array(240);
  W.set(key); // W[0..7] = key words

  for (let i = 8; i < 60; i++) {
    // temp = W[i-1]
    const t = new Uint8Array(4);
    t[0] = W[(i - 1) * 4 + 0];
    t[1] = W[(i - 1) * 4 + 1];
    t[2] = W[(i - 1) * 4 + 2];
    t[3] = W[(i - 1) * 4 + 3];

    if (i % 8 === 0) {
      // RotWord + SubWord + Rcon
      const tmp = t[0];
      t[0] = SBOX[t[1]] ^ RCON[i >>> 3];
      t[1] = SBOX[t[2]];
      t[2] = SBOX[t[3]];
      t[3] = SBOX[tmp];
    } else if (i % 8 === 4) {
      // SubWord only
      t[0] = SBOX[t[0]];
      t[1] = SBOX[t[1]];
      t[2] = SBOX[t[2]];
      t[3] = SBOX[t[3]];
    }

    for (let j = 0; j < 4; j++) {
      W[i * 4 + j] = W[(i - 8) * 4 + j] ^ t[j];
    }
  }
  return W;
}

// ─── AES-256 Encrypt Block ──────────────────────────────────────────────────

/** xtime: nhân với 2 trong GF(2^8). */
function xtime(a: number): number {
  return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff;
}

/**
 * Mã hóa 1 khối 16 byte bằng AES-256.
 *
 * Layout state THEO CHUẨN FIPS 197 (column-major):
 *   state[row + 4*col]  →  S[row][col]
 *   Input bytes:  block[i] = S[i mod 4][floor(i/4)]  =  state[i]   (nạp trực tiếp).
 *
 * @param roundKeys  240-byte round keys (từ aes256KeyExpand).
 * @param block      16-byte plaintext.
 * @returns          16-byte ciphertext (Uint8Array mới).
 */
export function aes256EncryptBlock(roundKeys: Uint8Array, block: Uint8Array): Uint8Array {
  const state = new Uint8Array(16);
  state.set(block); // column-major: state[r + 4c] = block[r + 4c]

  // AddRoundKey — vòng 0
  for (let i = 0; i < 16; i++) state[i] ^= roundKeys[i];

  // 14 vòng: 13 vòng đầy đủ + 1 vòng cuối (không MixColumns)
  for (let round = 1; round <= 14; round++) {
    // SubBytes
    for (let i = 0; i < 16; i++) state[i] = SBOX[state[i]];

    // ShiftRows — column-major: row r gồm state[r], state[r+4], state[r+8], state[r+12].
    // Dịch trái (cyclic) mỗi row r đi r vị trí.
    let t: number;
    // Row 1: shift left by 1.
    t = state[1]; state[1] = state[5]; state[5] = state[9]; state[9] = state[13]; state[13] = t;
    // Row 2: shift left by 2 (= swap 2 cặp).
    t = state[2];  state[2]  = state[10]; state[10] = t;
    t = state[6];  state[6]  = state[14]; state[14] = t;
    // Row 3: shift left by 3 (= shift right by 1).
    t = state[15]; state[15] = state[11]; state[11] = state[7]; state[7] = state[3]; state[3] = t;

    // MixColumns — column-major: cột c gồm state[4c..4c+3] (4 byte liên tiếp).
    if (round < 14) {
      for (let col = 0; col < 4; col++) {
        const off = col * 4;
        const c0 = state[off];
        const c1 = state[off + 1];
        const c2 = state[off + 2];
        const c3 = state[off + 3];
        const tAll = c0 ^ c1 ^ c2 ^ c3;
        state[off]     ^= tAll ^ xtime(c0 ^ c1);
        state[off + 1] ^= tAll ^ xtime(c1 ^ c2);
        state[off + 2] ^= tAll ^ xtime(c2 ^ c3);
        state[off + 3] ^= tAll ^ xtime(c3 ^ c0);
      }
    }

    // AddRoundKey
    const rkOff = round * 16;
    for (let i = 0; i < 16; i++) state[i] ^= roundKeys[rkOff + i];
  }

  return state;
}
