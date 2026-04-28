export class BitUtils {
  static rightRotate(value: number, shift: number): number {
    shift = shift % 32;
    return ((value >>> shift) | (value << (32 - shift))) >>> 0;
  }

  static rightShift(value: number, shift: number): number {
    return (value >>> shift) >>> 0;
  }

  static leftShift(value: number, shift: number): number {
    return (value << shift) >>> 0;
  }

  static xor(...args: number[]): number {
    return args.reduce((result, val) => (result ^ val) >>> 0, 0);
  }

  static and(a: number, b: number): number {
    return (a & b) >>> 0;
  }

  static or(a: number, b: number): number {
    return (a | b) >>> 0;
  }

  static not(value: number): number {
    return (~value) >>> 0;
  }

  static add(...args: number[]): number {
    return args.reduce((result, val) => ((result + val) >>> 0), 0);
  }

  static leftRotate(value: number, shift: number): number {
    shift = shift % 32;
    return ((value << shift) | (value >>> (32 - shift))) >>> 0;
  }

  static maj(x: number, y: number, z: number): number {
    return this.xor(this.and(x, y), this.and(x, z), this.and(y, z));
  }

  static ch(x: number, y: number, z: number): number {
    return this.xor(this.and(x, y), this.and(this.not(x), z));
  }

  static toHex8(value: number): string {
    return ('00000000' + (value >>> 0).toString(16)).slice(-8);
  }

  static bytesToHex(bytes: number[]): string {
    return bytes.map((b) => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
  }

  static rotateRight64(value: bigint, shift: bigint): bigint {
    const s = shift % 64n;
    return ((value >> s) | (value << (64n - s))) & 0xffffffffffffffffn;
  }

  static rotateLeft64(value: bigint, shift: bigint): bigint {
    const s = shift % 64n;
    return ((value << s) | (value >> (64n - s))) & 0xffffffffffffffffn;
  }
}
