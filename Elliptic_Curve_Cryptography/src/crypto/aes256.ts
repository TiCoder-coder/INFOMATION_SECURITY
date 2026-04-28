function gfMul(a: number, b: number): number {
  let result = 0;
  let aa = a & 0xff;
  let bb = b & 0xff;
  while (bb > 0) {
    if (bb & 1) result ^= aa;
    const hi = aa & 0x80;
    aa = (aa << 1) & 0xff;
    if (hi) aa ^= 0x1b; 
    bb >>>= 1;
  }
  return result;
}

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

function affineTx(x: number): number {
  let b = x & 0xff;
  let s = b;
  for (let i = 0; i < 4; i++) {
    b = ((b << 1) | (b >>> 7)) & 0xff;
    s ^= b;
  }
  return (s ^ 0x63) & 0xff;
}

const SBOX = new Uint8Array(256);
(function buildSBox() {
  for (let i = 0; i < 256; i++) {
    SBOX[i] = affineTx(gfInv(i));
  }
})();

const RCON = new Uint8Array(8);
(function buildRcon() {
  RCON[1] = 0x01;
  for (let i = 2; i <= 7; i++) RCON[i] = gfMul(RCON[i - 1], 2);
})();

export function aes256KeyExpand(key: Uint8Array): Uint8Array {
  if (key.length !== 32) throw new Error('AES-256 requires 32-byte key');
  const W = new Uint8Array(240);
  W.set(key); 

  for (let i = 8; i < 60; i++) {
    
    const t = new Uint8Array(4);
    t[0] = W[(i - 1) * 4 + 0];
    t[1] = W[(i - 1) * 4 + 1];
    t[2] = W[(i - 1) * 4 + 2];
    t[3] = W[(i - 1) * 4 + 3];

    if (i % 8 === 0) {
      
      const tmp = t[0];
      t[0] = SBOX[t[1]] ^ RCON[i >>> 3];
      t[1] = SBOX[t[2]];
      t[2] = SBOX[t[3]];
      t[3] = SBOX[tmp];
    } else if (i % 8 === 4) {
      
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

function xtime(a: number): number {
  return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff;
}

export function aes256EncryptBlock(roundKeys: Uint8Array, block: Uint8Array): Uint8Array {
  const state = new Uint8Array(16);
  state.set(block); 

  
  for (let i = 0; i < 16; i++) state[i] ^= roundKeys[i];

  
  for (let round = 1; round <= 14; round++) {
    
    for (let i = 0; i < 16; i++) state[i] = SBOX[state[i]];

    
    
    let t: number;
    
    t = state[1]; state[1] = state[5]; state[5] = state[9]; state[9] = state[13]; state[13] = t;
    
    t = state[2];  state[2]  = state[10]; state[10] = t;
    t = state[6];  state[6]  = state[14]; state[14] = t;
    
    t = state[15]; state[15] = state[11]; state[11] = state[7]; state[7] = state[3]; state[3] = t;

    
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

    
    const rkOff = round * 16;
    for (let i = 0; i < 16; i++) state[i] ^= roundKeys[rkOff + i];
  }

  return state;
}
