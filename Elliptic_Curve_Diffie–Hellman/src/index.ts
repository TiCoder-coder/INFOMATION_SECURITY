/**
 * index.ts
 * -----------------------------------------------------------
 * ORCHESTRATOR — chạy ĐÚNG theo lưu đồ ECDH:
 *
 *   [1] Chọn đường cong elliptic & bộ tham số miền T=(p,a,b,G,n,h)
 *   [2] Bên A sinh dA, QA = dA·G
 *   [3] Bên B sinh dB, QB = dB·G
 *   [4] Trao đổi QA, QB (kèm validate điểm thuộc đường cong)
 *   [5] Bên A tính SA = dA·QB
 *   [6] Bên B tính SB = dB·QA
 *   [7] SA == SB ?
 *        ├── Có   → K = KDF(S) rồi dùng K cho AES-GCM
 *        └── Không → Báo lỗi / Dừng
 *
 * TOÀN BỘ PHÉP TOÁN ECC + SHA-256 + HMAC + HKDF + AES + GCM
 * đều do project tự cài (không dùng thư viện crypto nào).
 * -----------------------------------------------------------
 */

import { loadConfig, saveKeyPair, loadKeyPair, keyPairExists } from "./io/index.ts";
import { selectDomainParameters, describeCurve } from "./config/index.ts";
import {
  generateKeyPair,
  generatePrivateScalar,
  derivePublicPoint,
  packKeyPair,
  packPublicKey,
  exchangePublicKeys,
  unpackAndValidate,
  computeSharedSecret,
  verifySharedSecrets,
  assertSharedSecretsEqual,
  constantTimeEqual,
  deriveSessionKey,
  hkdfExtract,
  hkdfExpand,
  encryptWithSessionKey,
  decryptWithSessionKey,
} from "./core/index.ts";
import {
  sha256,
  hmacSha256,
  keyExpansion256,
  aes256EncryptBlock,
  aesGcmEncrypt,
} from "./crypto/index.ts";
import {
  randomBytes,
  isOnCurve,
  scalarMultiply,
  decodePointUncompressed,
  type ECPoint,
} from "./math/index.ts";
import { logger } from "./utils/index.ts";

void generatePrivateScalar;
void derivePublicPoint;
void packKeyPair;
void sha256;
void constantTimeEqual;

function fullHex(buf: Buffer): string {
  return buf.toString("hex");
}

function hexOfBig(n: bigint, byteLen: number): string {
  return "0x" + n.toString(16).padStart(byteLen * 2, "0");
}

/**
 * In chi tiết từng sub-check của SP 800-56A §5.6.2.3.3
 * "Full Public-Key Validation".  Thực hiện TAY các bước để
 * ghi log từng phép kiểm tra, sau đó so khớp với kết quả của
 * `unpackAndValidate()` (vốn cũng tự kiểm tra đầy đủ).
 */
function logFullPublicKeyValidation(
  who: string,
  pubKey: Buffer,
  c: ReturnType<typeof selectDomainParameters>,
): ECPoint {
  logger.info(`Validate khoá công khai nhận cho ${who} (SP 800-56A §5.6.2.3.3):`);

  // (1) SEC1 prefix
  const prefix = pubKey[0];
  logger.detail(
    `(1) SEC1 prefix byte = 0x${prefix.toString(16).padStart(2, "0")} ` +
      `${prefix === 0x04 ? "✓ (uncompressed)" : "✗"}`,
  );

  // decode + (2) X<p, Y<p, (3) on-curve đều do decodePointUncompressed lo
  const Q: ECPoint = decodePointUncompressed(pubKey, c);
  logger.detail(`(2) X ∈ [0, p-1] ✓   X = ${hexOfBig(Q.x, c.byteLength)}`);
  logger.detail(`(2) Y ∈ [0, p-1] ✓   Y = ${hexOfBig(Q.y, c.byteLength)}`);

  // (3) y^2 ≡ x^3 + a*x + b (mod p)
  const onCurve = isOnCurve(Q, c);
  logger.detail(
    `(3) y² ≡ x³ + a·x + b (mod p)  → ${onCurve ? "✓" : "✗"}`,
  );

  // (4) Q ≠ O
  logger.detail(`(4) Q ≠ O (điểm vô cực)  → ${Q.infinity ? "✗" : "✓"}`);

  // (5) n·Q = O
  const nQ = scalarMultiply(c.n, Q, c);
  logger.detail(`(5) n·Q = O  → ${nQ.infinity ? "✓" : "✗"}  (bậc của Q chia hết n)`);

  if (prefix !== 0x04 || !onCurve || Q.infinity || !nQ.infinity) {
    throw new Error("[validate] Khoá công khai không hợp lệ");
  }
  return Q;
}

async function main(): Promise<void> {
  logger.section("ECDH KEY AGREEMENT — CÀI THỦ CÔNG (NO CRYPTO LIBRARY)");
  logger.info(`Nhật ký chi tiết được ghi vào: ${logger.logFile}`);

  // ─── [0] Nạp cấu hình .env ─────────────────────────────────
  logger.step(0, "Nạp cấu hình từ .env");
  const cfg = loadConfig();
  logger.kv("ECDH_CURVE", cfg.curveName);
  logger.kv("KDF_HASH", cfg.kdfHash);
  logger.hex("KDF_SALT", cfg.kdfSalt);
  logger.hex("KDF_INFO (utf8→bin)", cfg.kdfInfo);
  logger.kv("KDF_KEY_LENGTH", cfg.kdfKeyLength);
  logger.kv("SYMMETRIC_ALGORITHM", cfg.symmetricAlgorithm);
  logger.kv("KEY_DIR", cfg.keyDir);

  // ─── [1] Chọn đường cong ───────────────────────────────────
  logger.step(1, "Chọn đường cong elliptic & bộ tham số miền T = (p, a, b, G, n, h)");
  const c = selectDomainParameters(cfg.curveName);
  logger.info("Công thức đường cong:  y² ≡ x³ + a·x + b  (mod p)");
  logger.info("Bộ tham số miền (hardcoded theo NIST SP 800-186 / FIPS 186-4):");
  logger.bigHex("p  (modulus)", c.p, c.byteLength);
  logger.bigHex("a  (= p − 3)", c.a, c.byteLength);
  logger.bigHex("b", c.b, c.byteLength);
  logger.bigHex("Gx (base point)", c.Gx, c.byteLength);
  logger.bigHex("Gy (base point)", c.Gy, c.byteLength);
  logger.bigHex("n  (order of G)", c.n, c.byteLength);
  logger.kv("h  (cofactor)", c.h);
  logger.kv("byteLength", c.byteLength);
  const G: ECPoint = { x: c.Gx, y: c.Gy, infinity: false };
  logger.detail(
    `Kiểm tra G nằm trên đường cong  →  ${isOnCurve(G, c) ? "✓" : "✗"}`,
  );
  logger.block("Mô tả rút gọn", describeCurve(c));

  // ─── [2] Bên A sinh (dA, QA) ───────────────────────────────
  logger.step(2, "Bên A sinh khoá riêng dA và khoá công khai QA = dA · G");
  let partyA;
  if (keyPairExists(cfg.partyA.privateKeyPath, cfg.partyA.publicKeyPath)) {
    partyA = loadKeyPair(cfg.partyA.privateKeyPath, cfg.partyA.publicKeyPath, c);
    logger.success(`Nạp cặp khoá Bên A từ file ${cfg.partyA.privateKeyPath}`);
  } else {
    logger.info("Rejection sampling trên 32 byte ngẫu nhiên để chọn dA ∈ [1, n−1]");
    partyA = generateKeyPair("A", c);
    saveKeyPair(partyA, cfg.partyA.privateKeyPath, cfg.partyA.publicKeyPath);
    logger.success("Đã sinh & lưu cặp khoá Bên A.");
  }
  logger.info("Khoá riêng (phải giữ bí mật):");
  logger.bigHex("dA (BigInt)", partyA.d, c.byteLength);
  logger.hex("dA (Buffer32)", partyA.privateKey);
  logger.info("Khoá công khai QA = dA · G (double-and-add thủ công):");
  logger.bigHex("QA.x", partyA.Q.x, c.byteLength);
  logger.bigHex("QA.y", partyA.Q.y, c.byteLength);
  logger.hex("QA SEC1 (04‖X‖Y)", partyA.publicKey);
  logger.detail(
    `Kiểm tra QA trên curve → ${isOnCurve(partyA.Q, c) ? "✓" : "✗"}`,
  );

  // ─── [3] Bên B sinh (dB, QB) ───────────────────────────────
  logger.step(3, "Bên B sinh khoá riêng dB và khoá công khai QB = dB · G");
  let partyB;
  if (keyPairExists(cfg.partyB.privateKeyPath, cfg.partyB.publicKeyPath)) {
    partyB = loadKeyPair(cfg.partyB.privateKeyPath, cfg.partyB.publicKeyPath, c);
    logger.success(`Nạp cặp khoá Bên B từ file ${cfg.partyB.privateKeyPath}`);
  } else {
    logger.info("Rejection sampling trên 32 byte ngẫu nhiên để chọn dB ∈ [1, n−1]");
    partyB = generateKeyPair("B", c);
    saveKeyPair(partyB, cfg.partyB.privateKeyPath, cfg.partyB.publicKeyPath);
    logger.success("Đã sinh & lưu cặp khoá Bên B.");
  }
  logger.info("Khoá riêng (phải giữ bí mật):");
  logger.bigHex("dB (BigInt)", partyB.d, c.byteLength);
  logger.hex("dB (Buffer32)", partyB.privateKey);
  logger.info("Khoá công khai QB = dB · G (double-and-add thủ công):");
  logger.bigHex("QB.x", partyB.Q.x, c.byteLength);
  logger.bigHex("QB.y", partyB.Q.y, c.byteLength);
  logger.hex("QB SEC1 (04‖X‖Y)", partyB.publicKey);
  logger.detail(
    `Kiểm tra QB trên curve → ${isOnCurve(partyB.Q, c) ? "✓" : "✗"}`,
  );

  // ─── [4] Trao đổi QA, QB ──────────────────────────────────
  logger.step(4, "Trao đổi khoá công khai QA ↔ QB (kèm FULL public-key validation)");
  const envA = packPublicKey(partyA.owner, partyA.curveName, partyA.publicKey);
  const envB = packPublicKey(partyB.owner, partyB.curveName, partyB.publicKey);
  logger.info("Bên A gửi envelope QA sang B; Bên B gửi envelope QB sang A.");
  logger.detail(`envA.curveName = "${envA.curveName}"  envA.publicKey = 65 B`);
  logger.detail(`envB.curveName = "${envB.curveName}"  envB.publicKey = 65 B`);

  const QA_atB = logFullPublicKeyValidation("Bên B nhận QA từ A", envA.publicKey, c);
  const QB_atA = logFullPublicKeyValidation("Bên A nhận QB từ B", envB.publicKey, c);

  // Double-check qua hàm chính thức
  const exchanged = exchangePublicKeys(envA, envB, cfg.curveName, c);
  void unpackAndValidate; // đã dùng gián tiếp qua exchangePublicKeys
  if (
    exchanged.QA_receivedByB.x !== QA_atB.x ||
    exchanged.QB_receivedByA.x !== QB_atA.x
  ) {
    throw new Error("[exchange] sanity check thất bại");
  }
  logger.success("Cả hai bên đã xác thực điểm nhận được.");

  // ─── [5] SA = dA · QB ─────────────────────────────────────
  logger.step(5, "Bên A tính SA = dA × QB  (scalar multiply thủ công)");
  const sharedA = computeSharedSecret(partyA.d, exchanged.QB_receivedByA, c);
  logger.bigHex("SA.x", sharedA.point.x, c.byteLength);
  logger.bigHex("SA.y", sharedA.point.y, c.byteLength);
  logger.hex("Z_A = SA.x (big-endian)", sharedA.Z);

  // ─── [6] SB = dB · QA ─────────────────────────────────────
  logger.step(6, "Bên B tính SB = dB × QA  (scalar multiply thủ công)");
  const sharedB = computeSharedSecret(partyB.d, exchanged.QA_receivedByB, c);
  logger.bigHex("SB.x", sharedB.point.x, c.byteLength);
  logger.bigHex("SB.y", sharedB.point.y, c.byteLength);
  logger.hex("Z_B = SB.x (big-endian)", sharedB.Z);

  // ─── [7] SA == SB ? ───────────────────────────────────────
  logger.step(7, "Kiểm tra SA == SB (so sánh hằng thời gian)");
  const vr = verifySharedSecrets(sharedA.Z, sharedB.Z);
  logger.detail(`lengthA = ${vr.lengthA} B,  lengthB = ${vr.lengthB} B`);
  logger.detail(`constantTimeEqual(Z_A, Z_B) = ${vr.equal}`);
  if (!vr.equal) {
    logger.error("SA ≠ SB → BÁO LỖI / DỪNG (nhánh 'Không' của lưu đồ)");
    assertSharedSecretsEqual(sharedA.Z, sharedB.Z);
    return;
  }
  logger.success(
    `SA = SB ✓  — shared secret S đã thống nhất (${sharedA.Z.length} byte)`,
  );
  const S = sharedA.Z;

  // ─── [8a] K = KDF(S) ──────────────────────────────────────
  logger.step("8a", "Dẫn xuất khoá phiên K = HKDF-SHA256(salt, S, info, L) — tự cài");
  logger.info("Tuân theo RFC 5869 (NIST SP 800-56C):");
  logger.detail("PRK  = HMAC-SHA256(salt, IKM=S)");
  logger.detail("T(1) = HMAC-SHA256(PRK, info ‖ 0x01)");
  logger.detail("T(i) = HMAC-SHA256(PRK, T(i-1) ‖ info ‖ i)");
  logger.detail("OKM  = (T(1) ‖ T(2) ‖ …) cắt về L byte");
  logger.hex("IKM = S", S);
  logger.hex("salt", cfg.kdfSalt);
  logger.hex("info", cfg.kdfInfo);
  logger.kv("L (bytes)", cfg.kdfKeyLength);

  // Bước 1 — Extract
  const prk = hkdfExtract(cfg.kdfSalt, S);
  logger.hex("PRK (extract)", prk);

  // Bước 2 — Expand (tự lặp để log từng T(i))
  const N = Math.ceil(cfg.kdfKeyLength / 32);
  let prev: Buffer = Buffer.alloc(0);
  for (let i = 1; i <= N; i++) {
    const T_i = hmacSha256(prk, Buffer.concat([prev, cfg.kdfInfo, Buffer.from([i])]));
    logger.hex(`T(${i})`, T_i);
    prev = T_i;
  }

  // Dẫn xuất chính thức qua hàm gộp
  const K = deriveSessionKey(S, {
    salt: cfg.kdfSalt,
    info: cfg.kdfInfo,
    keyLength: cfg.kdfKeyLength,
  });
  // Sanity: K phải bằng prefix của prev concat
  const expanded = hkdfExpand(prk, cfg.kdfInfo, cfg.kdfKeyLength);
  if (!expanded.equals(K)) throw new Error("[hkdf] mismatch");
  logger.hex("K = OKM (session key)", K);
  logger.success(`K dài ${K.length} byte → sẵn sàng cho AES-256-GCM.`);

  // ─── [8b] Dùng K cho mã hoá đối xứng ──────────────────────
  logger.step("8b", "Mã hoá thông điệp bằng AES-256-GCM thủ công (NIST SP 800-38D)");
  const message =
    "Xin chào! Đây là thông điệp được mã hoá bằng khoá phiên ECDH (thủ công).";
  const plaintext = Buffer.from(message, "utf8");
  logger.info(`Plaintext M: "${message}"`);
  logger.hex("M (utf8 bytes)", plaintext);

  // Pre-generate IV để log
  const iv = randomBytes(12);
  logger.hex("IV (96-bit)", iv);

  // Log AES-256 internals
  const W = keyExpansion256(K);
  logger.detail(`AES-256 key schedule: ${W.length} words (= ${W.length * 4} byte).`);
  const H = aes256EncryptBlock(Buffer.alloc(16), W);
  logger.hex("H = E_K(0^128)", H);
  const J0 = Buffer.concat([iv, Buffer.from([0, 0, 0, 1])]);
  logger.hex("J0 = IV‖0x00000001", J0);

  // Dùng lại primitive (tránh IV khác nhau) qua aesGcmEncrypt trực tiếp
  const ctRaw = aesGcmEncrypt(K, iv, plaintext);
  const ct = {
    algorithm: "aes-256-gcm" as const,
    iv: ctRaw.iv,
    authTag: ctRaw.authTag,
    data: ctRaw.data,
  };
  logger.hex("Ciphertext C", ct.data);
  logger.hex("authTag (16 B)", ct.authTag);
  logger.detail(`len(M) = ${plaintext.length} B  →  len(C) = ${ct.data.length} B`);

  // ─── [9] Giải mã kiểm chứng ───────────────────────────────
  logger.step(9, "Bên nhận giải mã & xác thực tag (hằng thời gian)");
  const decoded = decryptWithSessionKey(ct, K);
  logger.hex("M' (sau khi giải mã)", decoded);
  logger.info(`M' (utf8) = "${decoded.toString("utf8")}"`);
  if (!decoded.equals(plaintext)) {
    throw new Error("[index] Giải mã không khớp plaintext!");
  }
  logger.success("Tag hợp lệ và M' == M  ✓");

  // Bonus: verify encryptWithSessionKey hoạt động với IV random nội bộ
  const ct2 = encryptWithSessionKey(message, K);
  const d2 = decryptWithSessionKey(ct2, K).toString("utf8");
  if (d2 !== message) throw new Error("[index] round-trip thứ 2 lỗi");
  logger.detail("Round-trip độc lập (IV random mới) → ✓");

  logger.section(
    "HOÀN TẤT — Toàn bộ ECC + SHA-256 + HMAC + HKDF + AES-GCM là thủ công",
  );
  logger.info(`Log chi tiết đã lưu tại: ${logger.logFile}`);
}

main().catch((err) => {
  logger.error(err instanceof Error ? err.stack || err.message : String(err));
  console.error("\n[FATAL]", err instanceof Error ? err.stack || err.message : err);
  process.exit(1);
});
