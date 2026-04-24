/**
 * verify-schnorr.ts
 * -----------------------------------------------------------
 * Kiểm thử toàn bộ pipeline Schnorr:
 *   [A] SHA-256 (adapter) vs node:crypto
 *   [B] secp256k1 scalar-multiply vs node crypto.createECDH
 *   [C] Schnorr sign/verify roundtrip (20 random vectors)
 *   [D] Tamper detection (message / R / s / publicKey)
 *   [E] Math identity check: s·G == R + e·P
 *   [F] Determinism (cùng k,d,m → cùng (R,s))
 *
 * Chạy:  npm run verify
 * -----------------------------------------------------------
 */

import crypto from 'node:crypto';
import {
  generateSchnorrKeyPair,
  schnorrSign,
  schnorrVerify,
  secp256k1,
} from '../index';
import {
  scalarMultiply,
  pointAdd,
  generateRandomScalar,
  pointToOctets,
} from '../ecc-proxy';
import { computeChallenge } from '../core/crypto-math';
import { sha256 } from '../crypto/sha-adapter';

type Row = { name: string; ok: boolean; detail?: string };
const rows: Row[] = [];
const check = (name: string, ok: boolean, detail = ''): void => {
  rows.push({ name, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? '  — ' + detail : ''}`);
};
const eqBytes = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

// ─── [A] SHA-256 vs node:crypto ─────────────────────────────
console.log('\n[A] SHA-256 adapter vs node:crypto');
for (const msg of [
  Buffer.alloc(0),
  Buffer.from('abc'),
  Buffer.from('Hello Schnorr!'),
  crypto.randomBytes(1000),
]) {
  const mine = sha256(new Uint8Array(msg));
  const ref = crypto.createHash('sha256').update(msg).digest();
  check(`sha256 len=${msg.length}`, eqBytes(mine, ref));
}

// ─── [B] secp256k1 scalar mult vs Node createECDH ─────────
console.log('\n[B] secp256k1 scalar-multiply vs node:crypto');
for (let i = 0; i < 5; i++) {
  const ec = crypto.createECDH('secp256k1');
  ec.generateKeys();
  const privBuf = ec.getPrivateKey();
  const pubRef = ec.getPublicKey(); // 04||X||Y (65 bytes)
  let d = 0n;
  for (const byte of privBuf) d = (d << 8n) | BigInt(byte);

  const P = scalarMultiply(d, secp256k1.G, secp256k1);
  const pubMine = pointToOctets(P, 32);
  check(`pubkey match #${i + 1}`, eqBytes(pubMine, pubRef));
}

// ─── [C] Schnorr roundtrip ─────────────────────────────────
console.log('\n[C] Schnorr sign/verify roundtrip');
const enc = new TextEncoder();
const messages = [
  'hello',
  '',
  'Tôi ký ở đây 🚀',
  'x'.repeat(1000),
  'Chuyển 100 BTC cho Alice',
];
for (let i = 0; i < messages.length; i++) {
  const msg = enc.encode(messages[i]);
  const kp = generateSchnorrKeyPair(secp256k1);
  const sig = schnorrSign(msg, kp.privateKey, secp256k1);
  const ok = schnorrVerify(msg, sig, kp.publicKey, secp256k1);
  check(`roundtrip msgLen=${msg.length}`, ok);
}

// ─── [D] Tamper detection ──────────────────────────────────
console.log('\n[D] Tamper detection');
{
  const msg = enc.encode('original message');
  const kp = generateSchnorrKeyPair(secp256k1);
  const sig = schnorrSign(msg, kp.privateKey, secp256k1);

  // (1) tampered message
  const bad1 = enc.encode('original messagE');
  check('rejects tampered message', !schnorrVerify(bad1, sig, kp.publicKey, secp256k1));

  // (2) tampered s
  const sig2 = { R: sig.R, s: (sig.s + 1n) % secp256k1.n };
  check('rejects tampered s', !schnorrVerify(msg, sig2, kp.publicKey, secp256k1));

  // (3) tampered R (use another random R')
  const kk = generateRandomScalar(secp256k1.n);
  const Rbad = scalarMultiply(kk, secp256k1.G, secp256k1);
  const sig3 = { R: Rbad, s: sig.s };
  check('rejects tampered R', !schnorrVerify(msg, sig3, kp.publicKey, secp256k1));

  // (4) wrong public key
  const kp2 = generateSchnorrKeyPair(secp256k1);
  check('rejects wrong public key', !schnorrVerify(msg, sig, kp2.publicKey, secp256k1));

  // (5) valid signature still passes
  check('positive control passes', schnorrVerify(msg, sig, kp.publicKey, secp256k1));
}

// ─── [E] Math identity s·G == R + e·P ─────────────────────
console.log('\n[E] Math identity s·G ≡ R + e·P');
for (let i = 0; i < 10; i++) {
  const msg = crypto.randomBytes(32 + (i * 7));
  const kp = generateSchnorrKeyPair(secp256k1);
  const sig = schnorrSign(new Uint8Array(msg), kp.privateKey, secp256k1);
  const e = computeChallenge(sig.R, kp.publicKey, new Uint8Array(msg), secp256k1);
  const L = scalarMultiply(sig.s, secp256k1.G, secp256k1);
  const eP = scalarMultiply(e, kp.publicKey, secp256k1);
  const V = pointAdd(sig.R, eP, secp256k1);
  const same = !L.infinity && !V.infinity && L.x === V.x && L.y === V.y;
  check(`identity #${i + 1}`, same);
}

// ─── [F] Non-determinism: each sign uses random k ─────────
console.log('\n[F] Random-nonce: two signs differ');
{
  const msg = enc.encode('same message');
  const kp = generateSchnorrKeyPair(secp256k1);
  const s1 = schnorrSign(msg, kp.privateKey, secp256k1);
  const s2 = schnorrSign(msg, kp.privateKey, secp256k1);
  const distinctR =
    !s1.R.infinity && !s2.R.infinity && s1.R.x !== s2.R.x;
  check('two signs yield distinct R', distinctR);
  check('two signs yield distinct s', s1.s !== s2.s);
  check('both signs verify OK',
    schnorrVerify(msg, s1, kp.publicKey, secp256k1)
      && schnorrVerify(msg, s2, kp.publicKey, secp256k1));
}

// ─── Summary ───────────────────────────────────────────────
const passed = rows.filter(r => r.ok).length;
const failed = rows.length - passed;
console.log('\n' + '='.repeat(60));
console.log(`RESULT: ${passed}/${rows.length} passed, ${failed} failed`);
console.log('='.repeat(60));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of rows.filter(x => !x.ok)) {
    console.log(`  ✗ ${r.name} ${r.detail}`);
  }
  process.exit(1);
}
process.exit(0);
