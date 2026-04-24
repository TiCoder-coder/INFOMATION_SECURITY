/**
 * verifyCrypto.ts
 * -----------------------------------------------------------
 * Kiểm thử toàn bộ primitive tự cài vs Node `crypto`:
 *   - SHA-256
 *   - HMAC-SHA256
 *   - HKDF (extract + expand)
 *   - AES-256 block encrypt (via ECB-1block oracle)
 *   - AES-256-GCM encrypt + decrypt (roundtrip & cross-check)
 *   - ECDH trên P-256 (scalarMultiply & shared secret)
 *
 * Chạy: npx tsx src/scripts/verifyCrypto.ts
 * -----------------------------------------------------------
 */

import crypto from "node:crypto";
import { sha256 } from "../crypto/sha256.ts";
import { hmacSha256 } from "../crypto/hmac.ts";
import { hkdfExtract, hkdfExpand } from "../core/kdf.ts";
import { keyExpansion256, aes256EncryptBlock } from "../crypto/aes256.ts";
import { aesGcmEncrypt, aesGcmDecrypt } from "../crypto/gcm.ts";
import { selectDomainParameters } from "../config/domainParameters.ts";
import { scalarMultiply, encodePointUncompressed } from "../math/ecPoint.ts";
import type { ECPoint } from "../math/ecPoint.ts";
import { bufferToBigInt, bigIntToBuffer } from "../math/bigintMath.ts";

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];

function eq(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && a.equals(b);
}
function check(name: string, ok: boolean, detail = ""): void {
  results.push({ name, ok, detail });
  const sym = ok ? "✓" : "✗";
  console.log(`  ${sym} ${name}${detail ? "  — " + detail : ""}`);
}

// ─── 1. SHA-256 ────────────────────────────────────────────
console.log("\n[1] SHA-256 vs node:crypto");
for (const msg of [
  Buffer.alloc(0),
  Buffer.from("abc"),
  Buffer.from("The quick brown fox jumps over the lazy dog"),
  crypto.randomBytes(1000),
]) {
  const mine = sha256(msg);
  const ref = crypto.createHash("sha256").update(msg).digest();
  check(`sha256 len=${msg.length}`, eq(mine, ref));
}

// ─── 2. HMAC-SHA256 ────────────────────────────────────────
console.log("\n[2] HMAC-SHA256 vs node:crypto");
for (const [kl, ml] of [
  [16, 0], [32, 50], [64, 128], [100, 500], [200, 4],
] as const) {
  const k = crypto.randomBytes(kl);
  const m = crypto.randomBytes(ml);
  const mine = hmacSha256(k, m);
  const ref = crypto.createHmac("sha256", k).update(m).digest();
  check(`hmac keyLen=${kl} msgLen=${ml}`, eq(mine, ref));
}

// ─── 3. HKDF ───────────────────────────────────────────────
console.log("\n[3] HKDF-SHA256 vs node:crypto");
for (const L of [16, 32, 42, 64, 100, 255 * 32]) {
  const ikm = crypto.randomBytes(32);
  const salt = crypto.randomBytes(16);
  const info = crypto.randomBytes(8);
  const prkMine = hkdfExtract(salt, ikm);
  const okmMine = hkdfExpand(prkMine, info, L);
  const okmRef = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, info, L));
  check(`hkdf L=${L}`, eq(okmMine, okmRef));
}
// Edge: empty salt → RFC says use HashLen zeros
{
  const ikm = crypto.randomBytes(32);
  const info = Buffer.alloc(0);
  const L = 42;
  const prkMine = hkdfExtract(Buffer.alloc(0), ikm);
  const okmMine = hkdfExpand(prkMine, info, L);
  const okmRef = Buffer.from(
    crypto.hkdfSync("sha256", ikm, Buffer.alloc(0), info, L),
  );
  check(`hkdf empty salt L=${L}`, eq(okmMine, okmRef));
}

// ─── 4. AES-256 block ──────────────────────────────────────
console.log("\n[4] AES-256 single-block vs node:crypto (ECB)");
for (let i = 0; i < 5; i++) {
  const key = crypto.randomBytes(32);
  const blk = crypto.randomBytes(16);
  const W = keyExpansion256(key);
  const mine = aes256EncryptBlock(blk, W);
  const cipher = crypto.createCipheriv("aes-256-ecb", key, null);
  cipher.setAutoPadding(false);
  const ref = Buffer.concat([cipher.update(blk), cipher.final()]);
  check(`aes-256 block #${i + 1}`, eq(mine, ref));
}

// ─── 5. AES-256-GCM ────────────────────────────────────────
console.log("\n[5] AES-256-GCM vs node:crypto");
for (const [pl, al] of [
  [0, 0], [15, 0], [16, 0], [17, 0], [100, 0],
  [50, 32], [200, 17], [1024, 64],
] as const) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const pt = crypto.randomBytes(pl);
  const aad = crypto.randomBytes(al);

  // Ours
  const mine = aesGcmEncrypt(key, iv, pt, aad);

  // Ref
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  if (al > 0) cipher.setAAD(aad);
  const refCt = Buffer.concat([cipher.update(pt), cipher.final()]);
  const refTag = cipher.getAuthTag();

  const dataOk = eq(mine.data, refCt);
  const tagOk = eq(mine.authTag, refTag);
  check(`gcm enc pl=${pl} al=${al}`, dataOk && tagOk,
        dataOk && tagOk ? "" : `data=${dataOk} tag=${tagOk}`);

  // Cross-decrypt: ours decrypts node's output
  const decOurs = aesGcmDecrypt(
    key,
    { iv, authTag: refTag, data: refCt },
    aad,
  );
  check(`gcm dec(ours←node) pl=${pl} al=${al}`, eq(decOurs, pt));

  // Node decrypts ours
  const dec = crypto.createDecipheriv("aes-256-gcm", key, iv);
  if (al > 0) dec.setAAD(aad);
  dec.setAuthTag(mine.authTag);
  const decNode = Buffer.concat([dec.update(mine.data), dec.final()]);
  check(`gcm dec(node←ours) pl=${pl} al=${al}`, eq(decNode, pt));
}

// GCM tamper detection
{
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const pt = Buffer.from("sensitive payload");
  const ct = aesGcmEncrypt(key, iv, pt);
  const bad = { ...ct, data: Buffer.from(ct.data) };
  bad.data[0] ^= 1;
  let threw = false;
  try { aesGcmDecrypt(key, bad); } catch { threw = true; }
  check("gcm rejects tampered ciphertext", threw);
}

// ─── 6. ECDH on P-256 ──────────────────────────────────────
console.log("\n[6] ECDH P-256 vs node:crypto");
const c = selectDomainParameters("prime256v1");
for (let i = 0; i < 3; i++) {
  // Generate via Node, compute via ours, compare
  const refA = crypto.createECDH("prime256v1");
  refA.generateKeys();
  const refB = crypto.createECDH("prime256v1");
  refB.generateKeys();

  const dA = bufferToBigInt(refA.getPrivateKey());
  const dB = bufferToBigInt(refB.getPrivateKey());

  const G: ECPoint = { x: c.Gx, y: c.Gy, infinity: false };
  const QA = scalarMultiply(dA, G, c);
  const QB = scalarMultiply(dB, G, c);

  // Compare public points (SEC1 uncompressed)
  const QAenc = encodePointUncompressed(QA, c);
  const QBenc = encodePointUncompressed(QB, c);
  const QArefBuf = refA.getPublicKey(); // already 04||X||Y
  const QBrefBuf = refB.getPublicKey();
  check(`pub A match #${i + 1}`, eq(QAenc, QArefBuf));
  check(`pub B match #${i + 1}`, eq(QBenc, QBrefBuf));

  // Shared secrets
  const SA = scalarMultiply(dA, QB, c);
  const SB = scalarMultiply(dB, QA, c);
  const ZA = bigIntToBuffer(SA.x, c.byteLength);
  const ZB = bigIntToBuffer(SB.x, c.byteLength);
  const ZRef = refA.computeSecret(QBrefBuf);
  check(`Z matches (SA=SB=ref) #${i + 1}`, eq(ZA, ZB) && eq(ZA, ZRef));
}

// ─── Summary ───────────────────────────────────────────────
const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;
console.log("\n" + "=".repeat(60));
console.log(`RESULT: ${passed}/${results.length} passed, ${failed} failed`);
console.log("=".repeat(60));
if (failed > 0) {
  console.log("\nFAILED:");
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  ✗ ${r.name} ${r.detail}`);
  }
  process.exit(1);
}
