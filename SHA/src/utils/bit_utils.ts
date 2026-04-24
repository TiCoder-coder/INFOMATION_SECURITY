/**
 * Bit Utils - Các phép toán bit cơ bản cho SHA
 */

export class BitUtils {
  /**
   * Quay phải (Right Rotate)
   * @param value - Giá trị cần quay
   * @param shift - Số bit cần quay
   * @returns Kết quả sau khi quay phải
   */
  static rightRotate(value: number, shift: number): number {
    shift = shift % 32;
    return ((value >>> shift) | (value << (32 - shift))) >>> 0;
  }

  /**
   * Dịch phải (Right Shift)
   */
  static rightShift(value: number, shift: number): number {
    return (value >>> shift) >>> 0;
  }

  /**
   * Dịch trái (Left Shift)
   */
  static leftShift(value: number, shift: number): number {
    return (value << shift) >>> 0;
  }

  /**
   * XOR - Phép XOR
   */
  static xor(...args: number[]): number {
    return args.reduce((result, val) => (result ^ val) >>> 0, 0);
  }

  /**
   * AND - Phép AND
   */
  static and(a: number, b: number): number {
    return (a & b) >>> 0;
  }

  /**
   * OR - Phép OR
   */
  static or(a: number, b: number): number {
    return (a | b) >>> 0;
  }

  /**
   * NOT - Phép NOT
   */
  static not(value: number): number {
    return (~value) >>> 0;
  }

  /**
   * Cộng modulo 2^32
   */
  static add(...args: number[]): number {
    return args.reduce((result, val) => ((result + val) >>> 0), 0);
  }

  /**
   * Quay trái (Left Rotate) - dùng cho SHA-1
   */
  static leftRotate(value: number, shift: number): number {
    shift = shift % 32;
    return ((value << shift) | (value >>> (32 - shift))) >>> 0;
  }

  /**
   * Majority function - (x AND y) XOR (x AND z) XOR (y AND z)
   */
  static maj(x: number, y: number, z: number): number {
    return this.xor(this.and(x, y), this.and(x, z), this.and(y, z));
  }

  /**
   * Choice function - (x AND y) XOR ((NOT x) AND z)
   */
  static ch(x: number, y: number, z: number): number {
    return this.xor(this.and(x, y), this.and(this.not(x), z));
  }

  /**
   * Convert số thập phân sang hex 8 ký tự
   */
  static toHex8(value: number): string {
    return ('00000000' + (value >>> 0).toString(16)).slice(-8);
  }

  /**
   * Convert byte array sang hex string
   */
  static bytesToHex(bytes: number[]): string {
    return bytes.map((b) => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
  }

  /**
   * Right rotate for 64-bit BigInt values
   */
  static rotateRight64(value: bigint, shift: bigint): bigint {
    const s = shift % 64n;
    return ((value >> s) | (value << (64n - s))) & 0xffffffffffffffffn;
  }

  /**
   * Left rotate for 64-bit BigInt values
   */
  static rotateLeft64(value: bigint, shift: bigint): bigint {
    const s = shift % 64n;
    return ((value << s) | (value >> (64n - s))) & 0xffffffffffffffffn;
  }
}
