// Demo có log CHI TIẾT: thực hiện thủ công từng bước của ECIES để ghi lại
// tất cả giá trị trung gian (k, R, z, K, EK, MK, EM, TAG) vào logs/*.txt.
import { loadDefaultCurve } from '../config/load-default-curve';
import { loadEciesConfigFromEnv } from '../config/load-ecies-config-from-env';
import { loadReceiverKeyPairFromEnv } from '../config/load-receiver-key-from-env';
import { generateKeyPair } from '../keys/generate-key-pair';
import { generateEphemeralKeyPair } from '../ecies/encrypt/generate-ephemeral';
import { computeSharedSecret } from '../ecdh/compute-shared-secret';
import { deriveEncryptionKeys } from '../ecies/shared/derive-encryption-keys';
import { symmetricEncrypt } from '../symmetric/symmetric-encrypt';
import { symmetricDecrypt } from '../symmetric/symmetric-decrypt';
import { computeMac } from '../mac/compute-mac';
import { verifyMac } from '../mac/verify-mac';
import { validatePublicPoint } from '../curve/validate-public-point';
import { isCurveNonSingular } from '../domain/validation/check-non-singular';
import { fieldElementToOctets } from '../encoding/field-element-to-octets';
import { fieldSizeBytes } from '../encoding/field-size';
import { EciesLogger } from '../logging/ecies-logger';

function main(): void {
  const log = new EciesLogger();

  // ===========================================================================
  log.section('ECIES — ELLIPTIC CURVE INTEGRATED ENCRYPTION SCHEME (SEC 1)');
  log.line('Thời gian chạy : ' + new Date().toISOString());
  log.line('Ý nghĩa        : mã hóa thông điệp M bằng khóa công khai QV của bên nhận,');
  log.line('                 sử dụng ECDH + KDF + mã hóa đối xứng + MAC.');

  // ===========================================================================
  log.section('GIAI ĐOẠN 0 — CHỌN ĐƯỜNG CONG & KIỂM TRA THAM SỐ MIỀN T');
  log.line('Bộ tham số miền T = (p, a, b, G, n, h) theo SEC 1.');
  log.line('Phương trình đường cong:  y² = x³ + a·x + b (mod p)');

  const T = loadDefaultCurve();
  const cfg = loadEciesConfigFromEnv();

  log.stepLog('Nạp tham số miền từ .env', `Curve: ${T.name}`);
  log.hex('p  (prime field)', T.p);
  log.hex('a  (coefficient)', T.a);
  log.hex('b  (coefficient)', T.b);
  if (!T.G.infinity) {
    log.hex('Gx (base point x)', T.G.x);
    log.hex('Gy (base point y)', T.G.y);
  }
  log.hex('n  (order of G)', T.n);
  log.kv('h  (cofactor)', T.h.toString());

  log.stepLog(
    'Kiểm tra điều kiện không suy biến',
    '4·a³ + 27·b² ≢ 0 (mod p) để đường cong không có điểm kỳ dị.',
  );
  const ok = isCurveNonSingular(T.a, T.b, T.p);
  log.kv('Non-singular?', ok);
  if (!ok) throw new Error('Curve suy biến');

  log.stepLog('Cấu hình ECIES', JSON.stringify(cfg));

  // ===========================================================================
  log.section('GIAI ĐOẠN 1 — BÊN NHẬN (BOB) SINH CẶP KHÓA (dV, QV)');
  log.line('Công thức:  QV = dV · G');
  log.line('Ý nghĩa  :  dV là khóa riêng (bí mật), QV là khóa công khai (gửi cho bên gửi).');

  const bob = loadReceiverKeyPairFromEnv(T) ?? generateKeyPair(T);
  log.stepLog(
    'Chọn ngẫu nhiên dV, 1 ≤ dV ≤ n−1',
    'Dùng CSPRNG (crypto.randomBytes) + rejection sampling.',
  );
  log.hex('dV (PRIVATE — bí mật!)', bob.privateKey);

  log.stepLog('Tính QV = dV · G bằng thuật toán double-and-add');
  if (!bob.publicKey.Q.infinity) {
    log.hex('QV.x', bob.publicKey.Q.x);
    log.hex('QV.y', bob.publicKey.Q.y);
  }
  log.stepLog(
    'Xác thực QV có nằm trên đường cong không',
    'Bước này giúp phát hiện khóa công khai giả mạo.',
  );
  log.kv('QV valid?', validatePublicPoint(bob.publicKey.Q, T));

  // ===========================================================================
  log.section('GIAI ĐOẠN 2 — BÊN GỬI (ALICE) MÃ HÓA  M  THÀNH  C = (R, EM, TAG)');

  const M = Buffer.from('Xin chào Bob — đây là thông điệp bí mật của Alice.', 'utf8');
  log.stepLog('Chuẩn bị thông điệp M', `UTF-8 dài ${M.length} byte`);
  log.buf('M (hex)', M);
  log.line('    • M (text)                     = ' + M.toString('utf8'));

  log.stepLog(
    'Sinh ephemeral key pair (k, R)',
    'R = k · G. k là khóa tạm thời — KHÔNG tái sử dụng giữa các lần mã hóa.',
  );
  const ephemeral = generateEphemeralKeyPair(T);
  const k = ephemeral.privateKey;
  const R = ephemeral.publicKey.Q;
  log.hex('k  (ephemeral private)', k);
  if (!R.infinity) {
    log.hex('R.x', R.x);
    log.hex('R.y', R.y);
  }

  log.stepLog(
    'Xác thực QV hợp lệ trước khi tính shared secret',
    'Tránh invalid-curve attack (đối phương gửi khóa công khai rởm để leak dV).',
  );
  if (!validatePublicPoint(bob.publicKey.Q, T)) throw new Error('QV không hợp lệ');
  log.kv('QV check', 'PASS');

  log.stepLog(
    'Tính shared secret z = k · QV (ECDH phía gửi)',
    'Tọa độ x của điểm kết quả chính là bí mật chung.',
  );
  const z = computeSharedSecret(k, bob.publicKey.Q, T);
  log.hex('z (shared secret x-coord)', z);

  log.stepLog(
    'Chuyển z thành chuỗi byte Z (FieldElementToOctetString)',
    'Độ dài cố định = ceil(log2(p) / 8) byte.',
  );
  const Z = fieldElementToOctets(z, fieldSizeBytes(T.p));
  log.buf('Z', Z);

  log.stepLog(
    'Dùng KDF (KDF2 ANSI X9.63) sinh keying data K',
    `K = Hash(Z ‖ 1) ‖ Hash(Z ‖ 2) ‖ …  với Hash = ${cfg.kdfHash}.`,
  );
  const { EK, MK } = deriveEncryptionKeys(z, T, cfg);
  log.buf('EK (encryption key)', EK);
  log.buf('MK (MAC key)', MK);

  log.stepLog(
    'Mã hóa đối xứng: EM = IV ‖ AES-256-CTR(EK, M)',
    'IV ngẫu nhiên 16 byte. Kết quả đóng gói IV phía trước ciphertext.',
  );
  const sym = symmetricEncrypt(EK, M);
  const EM = Buffer.concat([sym.iv, sym.ct]);
  log.buf('IV', sym.iv);
  log.buf('CT (AES-CTR output)', sym.ct);
  log.buf('EM (= IV ‖ CT)', EM);

  log.stepLog(
    'Tính thẻ toàn vẹn TAG = HMAC-SHA256(MK, EM)',
    'Dùng encrypt-then-MAC — chuẩn bảo mật hiện đại.',
  );
  const TAG = computeMac(MK, EM);
  log.buf('TAG', TAG);

  log.stepLog(
    'Đóng gói bản mã C = (R, EM, TAG)',
    'R để bên nhận tính lại z; EM là dữ liệu mã hóa; TAG để kiểm toàn vẹn.',
  );

  // ===========================================================================
  log.section('GIAI ĐOẠN 3 — BÊN NHẬN (BOB) GIẢI MÃ  C → M');

  log.stepLog(
    'Nhận C = (R, EM, TAG). Kiểm tra R có nằm trên đường cong không',
    'Chống invalid-curve attack — đối phương có thể gửi R bất hợp pháp.',
  );
  const rOk = validatePublicPoint(R, T);
  log.kv('R valid?', rOk);
  if (!rOk) throw new Error('R invalid');

  log.stepLog(
    "Tính lại shared secret z' = dV · R (ECDH phía nhận)",
    "Theo tính chất ECDH:  dV·R = dV·(k·G) = k·(dV·G) = k·QV → z' = z.",
  );
  const zPrime = computeSharedSecret(bob.privateKey, R, T);
  log.hex("z' (recomputed)", zPrime);
  log.kv("z' = z ?", zPrime === z);

  log.stepLog('Dùng KDF sinh lại K, tách EK, MK (giống bên gửi)');
  const recovered = deriveEncryptionKeys(zPrime, T, cfg);
  log.kv('EK khớp?', Buffer.compare(recovered.EK, EK) === 0);
  log.kv('MK khớp?', Buffer.compare(recovered.MK, MK) === 0);

  log.stepLog(
    'Kiểm tra TAG bằng MK (HMAC verify, constant-time)',
    'Đây là cổng "TAG hợp lệ?" trong flowchart:\n' +
      '  - ĐÚNG  → tiếp tục giải mã EM.\n' +
      '  - SAI   → trả về "Bản mã không hợp lệ" (DỪNG, KHÔNG giải mã).',
  );
  const tagOk = verifyMac(recovered.MK, EM, TAG);
  log.kv('TAG hợp lệ?', tagOk);
  if (!tagOk) throw new Error('TAG invalid');

  log.stepLog(
    "Giải mã đối xứng: M' = AES-256-CTR-decrypt(EK, IV, CT)",
    'Lấy IV 16 byte đầu của EM, phần còn lại là CT.',
  );
  const iv2 = EM.subarray(0, 16);
  const ct2 = EM.subarray(16);
  const M2 = symmetricDecrypt(recovered.EK, iv2, ct2);
  log.buf("M' (hex)", M2);
  log.line("    • M' (text)                    = " + M2.toString('utf8'));

  log.stepLog("So sánh M với M' để xác nhận giải mã đúng");
  const matched = Buffer.compare(M, M2) === 0;
  log.kv('KẾT QUẢ', matched ? 'MÃ HÓA / GIẢI MÃ THÀNH CÔNG ✔' : 'SAI ✘');

  // ===========================================================================
  log.section('GIAI ĐOẠN 4 — KIỂM THỬ CÁC TRƯỜNG HỢP SAI');

  log.subsection('Case A: TAG bị sửa 1 bit');
  const tagBad = Buffer.from(TAG);
  tagBad[0] ^= 0x01;
  log.kv('verifyMac(MK, EM, TAG_bị_sửa)', verifyMac(MK, EM, tagBad));
  log.line('    → Hệ thống nhận diện được, trả về "Bản mã không hợp lệ".');

  log.subsection('Case B: EM bị sửa 1 bit');
  const emBad = Buffer.from(EM);
  emBad[emBad.length - 1] ^= 0x01;
  log.kv('verifyMac(MK, EM_bị_sửa, TAG)', verifyMac(MK, emBad, TAG));
  log.line('    → Hệ thống nhận diện được, trả về "Bản mã không hợp lệ".');

  log.subsection('Case C: Sai private key (Eve thử giải mã thư Bob)');
  const eve = generateKeyPair(T);
  const zEve = computeSharedSecret(eve.privateKey, R, T);
  const eveKeys = deriveEncryptionKeys(zEve, T, cfg);
  log.kv('verifyMac (với MK sai)', verifyMac(eveKeys.MK, EM, TAG));
  log.line('    → Eve KHÔNG thể giải mã vì z_Eve ≠ z, dẫn tới MK sai, TAG verify fail.');

  log.subsection('Case D: R là điểm không thuộc đường cong');
  const rFake = { infinity: false as const, x: 1n, y: 2n };
  log.kv('validatePublicPoint(R_fake)', validatePublicPoint(rFake, T));
  log.line('    → Bị từ chối ngay ở bước kiểm tra, không đi vào ECDH.');

  // ===========================================================================
  log.section('KẾT LUẬN');
  log.line('• Lược đồ ECIES bảo đảm:');
  log.line('    1. Tính bí mật      — chỉ bên có dV mới tính được z và EK.');
  log.line('    2. Tính toàn vẹn    — TAG = HMAC(MK, EM) phát hiện mọi sửa đổi.');
  log.line('    3. Tính xác thực    — verify TAG bằng MK dẫn xuất từ shared secret.');
  log.line('    4. Tiến lên phía trước — mỗi phiên dùng ephemeral key k mới.');
  log.line('• Các tấn công được chặn:');
  log.line('    - Bit-flipping ciphertext  → TAG fail.');
  log.line('    - Invalid-curve attack     → validatePublicPoint từ chối.');
  log.line('    - Timing attack trên MAC   → dùng timingSafeEqual.');
  log.line('');
  log.line('File log: ' + log.path);

  console.log('✔ ECIES chạy xong. Log chi tiết được ghi vào:');
  console.log('  ' + log.path);
}

main();
