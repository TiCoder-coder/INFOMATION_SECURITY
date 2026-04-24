/**
 * Padding Handler
 * Bước 3: Padding (đệm thêm bit)
 * Bước 4: Ghi độ dài ban đầu của thông điệp
 */

import { Logger } from '../utils/logger';
import { TypeConverter } from '../utils/type_converter';

/**
 * Encode độ dài bit của message thành big-endian bytes với độ rộng cố định.
 * Dùng BigInt để xử lý chính xác message dài hơn 2^29 byte (ngưỡng mà
 * bit-shift trên `number` 32-bit của JavaScript bắt đầu cắt mất bit cao).
 */
function encodeBitLengthBE(byteLength: number, widthBytes: number): number[] {
  const bitLength = BigInt(byteLength) * 8n;
  const out = new Array<number>(widthBytes);
  for (let i = widthBytes - 1; i >= 0; i--) {
    out[i] = Number((bitLength >> BigInt((widthBytes - 1 - i) * 8)) & 0xffn);
  }
  return out;
}

export class PaddingHandler {
  /**
   * Thêm padding cho SHA-256 / SHA-224 (block size = 512 bits = 64 bytes)
   */
  static padSHA256(bytes: number[], logger: Logger): number[] {
    logger.step(3, 'Padding - Thêm bit 1 và các bit 0');
    logger.explain(`
SHA-256 yêu cầu độ dài message sau padding phải ≡ 448 (mod 512) bit,
tức 56 bytes (mod 64). 8 bytes cuối dành cho độ dài gốc (64-bit).
Quy tắc padding (FIPS 180-4):
  1. Nối bit "1" ngay sau bit cuối của message → byte 0x80.
  2. Nối các bit "0" cho đến khi độ dài ≡ 56 mod 64 bytes.
  3. Nối độ dài gốc (bit, big-endian) dưới dạng 64-bit integer.
`);
    const originalLength = bytes.length;

    bytes.push(0x80);
    logger.info(`(1) Thêm 0x80 (bit 1 + bảy bit 0) — len hiện tại: ${bytes.length} bytes`);

    let zerosAdded = 0;
    while ((bytes.length % 64) !== 56) {
      bytes.push(0x00);
      zerosAdded++;
    }
    logger.info(`(2) Thêm ${zerosAdded} byte 0x00 để đạt mod 64 = 56. Len: ${bytes.length} bytes`);

    logger.step(4, 'Ghi độ dài ban đầu của thông điệp (64-bit, big-endian)');
    const lengthBytes = encodeBitLengthBE(originalLength, 8);
    bytes.push(...lengthBytes);
    const bitLength = BigInt(originalLength) * 8n;
    logger.info(`Độ dài gốc: ${originalLength} bytes = ${bitLength} bit`);
    logger.info(`Length bytes (big-endian): ${lengthBytes.map((b) => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);
    logger.info(`Tổng độ dài sau padding: ${bytes.length} bytes = ${bytes.length * 8} bit (bội số của 512)`);
    logger.hex('Padded (hex)', TypeConverter.bytesToHex(bytes));

    return bytes;
  }

  /**
   * Thêm padding cho SHA-512 / SHA-384 (block size = 1024 bits = 128 bytes)
   */
  static padSHA512(bytes: number[], logger: Logger): number[] {
    logger.step(3, 'Padding - Thêm bit 1 và các bit 0 (SHA-512)');
    logger.explain(`
SHA-512 yêu cầu độ dài sau padding ≡ 896 (mod 1024) bit, tức 112 (mod 128) byte.
16 bytes cuối dành cho độ dài gốc (128-bit big-endian).
Quy tắc giống SHA-256 nhưng block = 1024 bit, length field = 128 bit.
`);
    const originalLength = bytes.length;

    bytes.push(0x80);
    logger.info(`(1) Thêm 0x80 — len: ${bytes.length}`);

    let zerosAdded = 0;
    while ((bytes.length % 128) !== 112) {
      bytes.push(0x00);
      zerosAdded++;
    }
    logger.info(`(2) Thêm ${zerosAdded} byte 0x00. Len: ${bytes.length}`);

    logger.step(4, 'Ghi độ dài ban đầu của thông điệp (128-bit, big-endian)');
    const lengthBytes = encodeBitLengthBE(originalLength, 16);
    bytes.push(...lengthBytes);
    const bitLength = BigInt(originalLength) * 8n;
    logger.info(`Độ dài gốc: ${originalLength} bytes = ${bitLength} bit`);
    logger.info(`Tổng độ dài sau padding: ${bytes.length} bytes = ${bytes.length * 8} bit (bội số của 1024)`);
    logger.hex('Padded (hex)', TypeConverter.bytesToHex(bytes));

    return bytes;
  }

  /**
   * Thêm padding cho SHA-1 (block size = 512 bits = 64 bytes)
   */
  static padSHA1(bytes: number[], logger: Logger): number[] {
    logger.step(3, 'Padding - Thêm bit 1 và các bit 0 (SHA-1)');
    logger.explain(`
SHA-1 dùng cùng quy tắc padding như SHA-256: bit "1" + các bit "0" + 64-bit
độ dài (big-endian), block 512 bit.
`);
    const originalLength = bytes.length;

    bytes.push(0x80);
    logger.info(`(1) Thêm 0x80 — len: ${bytes.length}`);

    let zerosAdded = 0;
    while ((bytes.length % 64) !== 56) {
      bytes.push(0x00);
      zerosAdded++;
    }
    logger.info(`(2) Thêm ${zerosAdded} byte 0x00. Len: ${bytes.length}`);

    logger.step(4, 'Ghi độ dài ban đầu của thông điệp (64-bit, big-endian)');
    const lengthBytes = encodeBitLengthBE(originalLength, 8);
    bytes.push(...lengthBytes);
    const bitLength = BigInt(originalLength) * 8n;
    logger.info(`Độ dài gốc: ${originalLength} bytes = ${bitLength} bit`);
    logger.info(`Tổng độ dài sau padding: ${bytes.length} bytes = ${bytes.length * 8} bit`);
    logger.hex('Padded (hex)', TypeConverter.bytesToHex(bytes));

    return bytes;
  }
}
