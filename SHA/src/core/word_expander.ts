/**
 * Word Expander
 * Bước 7: Tạo các từ mở rộng từ block dữ liệu
 */

import { BitUtils } from '../utils/bit_utils';
// (Removed unused ConstantsManager import)
import { Logger } from '../utils/logger';

export class WordExpander {
  /**
   * Mở rộng message schedule cho SHA-256 / SHA-224
   * Từ 16 word đầu mở rộng thành 64 word
   */
  static expandSHA256(blockWords: number[], logger: Logger): number[] {
    logger.step(7, 'Tạo các từ mở rộng (SHA-256: 16 → 64 words)');
    logger.explain(`
Mỗi block 512-bit được chia thành 16 từ 32-bit (W[0]..W[15]).
48 từ còn lại (W[16]..W[63]) được sinh ra bằng công thức sau (FIPS 180-4):

  σ0(x) = ROTR(x,7)  XOR ROTR(x,18) XOR SHR(x,3)
  σ1(x) = ROTR(x,17) XOR ROTR(x,19) XOR SHR(x,10)
  W[i]  = σ1(W[i-2]) + W[i-7] + σ0(W[i-15]) + W[i-16]   (mod 2^32)
`);
    logger.formula('σ0', 'ROTR(x,7) XOR ROTR(x,18) XOR SHR(x,3)');
    logger.formula('σ1', 'ROTR(x,17) XOR ROTR(x,19) XOR SHR(x,10)');
    logger.formula('W[i]', 'σ1(W[i-2]) + W[i-7] + σ0(W[i-15]) + W[i-16]');

    const w: number[] = [...blockWords];
    logger.note('16 word đầu (lấy trực tiếp từ block):');
    for (let i = 0; i < 16; i++) {
      logger.note(`  W[${i.toString().padStart(2)}] = 0x${(w[i] >>> 0).toString(16).padStart(8, '0')}`);
    }

    for (let i = 16; i < 64; i++) {
      const s0 = BitUtils.xor(
        BitUtils.rightRotate(w[i - 15], 7),
        BitUtils.rightRotate(w[i - 15], 18),
        BitUtils.rightShift(w[i - 15], 3)
      );
      const s1 = BitUtils.xor(
        BitUtils.rightRotate(w[i - 2], 17),
        BitUtils.rightRotate(w[i - 2], 19),
        BitUtils.rightShift(w[i - 2], 10)
      );
      w[i] = BitUtils.add(w[i - 16], s0, w[i - 7], s1);
    }

    logger.note('48 word mở rộng (W[16]..W[63]):');
    for (let i = 16; i < 64; i++) {
      logger.note(`  W[${i.toString().padStart(2)}] = 0x${(w[i] >>> 0).toString(16).padStart(8, '0')}`);
    }

    return w;
  }

  /**
   * Mở rộng message schedule cho SHA-1
   * Từ 16 word đầu mở rộng thành 80 word
   */
  static expandSHA1(blockWords: number[], logger: Logger): number[] {
    logger.step(7, 'Tạo các từ mở rộng (SHA-1: 16 → 80 words)');
    logger.explain(`
SHA-1 mở rộng message schedule bằng công thức đơn giản hơn SHA-2:
  W[i] = ROTL(W[i-3] XOR W[i-8] XOR W[i-14] XOR W[i-16], 1)   với 16 ≤ i < 80
`);
    logger.formula('W[i]', 'ROTL( W[i-3] XOR W[i-8] XOR W[i-14] XOR W[i-16], 1 )');

    const w: number[] = [...blockWords];
    logger.note('16 word đầu:');
    for (let i = 0; i < 16; i++) {
      logger.note(`  W[${i.toString().padStart(2)}] = 0x${(w[i] >>> 0).toString(16).padStart(8, '0')}`);
    }

    for (let i = 16; i < 80; i++) {
      w[i] = BitUtils.leftRotate(
        BitUtils.xor(w[i - 3], w[i - 8], w[i - 14], w[i - 16]),
        1
      );
    }

    logger.note('64 word mở rộng (W[16]..W[79]):');
    for (let i = 16; i < 80; i++) {
      logger.note(`  W[${i.toString().padStart(2)}] = 0x${(w[i] >>> 0).toString(16).padStart(8, '0')}`);
    }

    return w;
  }

  /**
   * Mở rộng message schedule cho SHA-512 / SHA-384
   * Từ 16 word đầu mở rộng thành 80 word (64-bit)
   */
  static expandSHA512(blockWords: bigint[], logger: Logger): bigint[] {
    logger.step(7, 'Tạo các từ mở rộng (SHA-512: 16 → 80 words, 64-bit)');
    logger.explain(`
SHA-512 tương tự SHA-256 nhưng toán hạng 64-bit, số rotate khác:
  σ0(x) = ROTR(x,1)  XOR ROTR(x,8)  XOR SHR(x,7)
  σ1(x) = ROTR(x,19) XOR ROTR(x,61) XOR SHR(x,6)
  W[i]  = σ1(W[i-2]) + W[i-7] + σ0(W[i-15]) + W[i-16]   (mod 2^64)
`);
    logger.formula('σ0', 'ROTR(x,1) XOR ROTR(x,8) XOR SHR(x,7)');
    logger.formula('σ1', 'ROTR(x,19) XOR ROTR(x,61) XOR SHR(x,6)');

    const w: bigint[] = [...blockWords];
    logger.note('16 word đầu:');
    for (let i = 0; i < 16; i++) {
      logger.note(`  W[${i.toString().padStart(2)}] = 0x${w[i].toString(16).padStart(16, '0')}`);
    }

    for (let i = 16; i < 80; i++) {
      const s0 =
        BitUtils.rotateRight64(w[i - 15], 1n) ^
        BitUtils.rotateRight64(w[i - 15], 8n) ^
        (w[i - 15] >> 7n);
      const s1 =
        BitUtils.rotateRight64(w[i - 2], 19n) ^
        BitUtils.rotateRight64(w[i - 2], 61n) ^
        (w[i - 2] >> 6n);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & 0xffffffffffffffffn;
    }

    logger.note('64 word mở rộng (W[16]..W[79]):');
    for (let i = 16; i < 80; i++) {
      logger.note(`  W[${i.toString().padStart(2)}] = 0x${w[i].toString(16).padStart(16, '0')}`);
    }

    return w;
  }
}
