import { BitUtils } from '../utils/bit_utils';
import { ConstantsManager } from '../utils/constants_manager';
import { Logger } from '../utils/logger';

const hex32 = (x: number) => '0x' + (x >>> 0).toString(16).padStart(8, '0');
const hex64 = (x: bigint) => '0x' + x.toString(16).padStart(16, '0');

export class CompressionEngine {
  static compressSHA256(
    blockWords: number[],
    hashState: number[],
    logger: Logger,
    label: string = 'SHA-256'
  ): number[] {
    logger.step(8, `Thực hiện các vòng nén (${label}: 64 rounds)`);
    logger.explain(`
Mỗi round ${label} cập nhật 8 working variable (a..h) theo:

  Σ0(a) = ROTR(a,2)  XOR ROTR(a,13) XOR ROTR(a,22)
  Σ1(e) = ROTR(e,6)  XOR ROTR(e,11) XOR ROTR(e,25)
  Ch(e,f,g)  = (e AND f) XOR ((NOT e) AND g)
  Maj(a,b,c) = (a AND b) XOR (a AND c) XOR (b AND c)

  T1 = h + Σ1(e) + Ch(e,f,g) + K[i] + W[i]
  T2 = Σ0(a) + Maj(a,b,c)

  h=g; g=f; f=e; e=d+T1; d=c; c=b; b=a; a=T1+T2    (mod 2^32)
`);

    let [a, b, c, d, e, f, g, h] = hashState;
    logger.note(
      `Init: a=${hex32(a)} b=${hex32(b)} c=${hex32(c)} d=${hex32(d)} ` +
        `e=${hex32(e)} f=${hex32(f)} g=${hex32(g)} h=${hex32(h)}`
    );

    for (let i = 0; i < 64; i++) {
      const S1 = BitUtils.xor(
        BitUtils.rightRotate(e, 6),
        BitUtils.rightRotate(e, 11),
        BitUtils.rightRotate(e, 25)
      );
      const ch = BitUtils.ch(e, f, g);
      const K = ConstantsManager.SHA256_CONSTANTS[i];
      const temp1 = BitUtils.add(h, S1, ch, K, blockWords[i]);

      const S0 = BitUtils.xor(
        BitUtils.rightRotate(a, 2),
        BitUtils.rightRotate(a, 13),
        BitUtils.rightRotate(a, 22)
      );
      const maj = BitUtils.maj(a, b, c);
      const temp2 = BitUtils.add(S0, maj);

      h = g; g = f; f = e;
      e = BitUtils.add(d, temp1);
      d = c; c = b; b = a;
      a = BitUtils.add(temp1, temp2);

      logger.round(
        i, 64,
        `K=${hex32(K)} W=${hex32(blockWords[i])} T1=${hex32(temp1)} T2=${hex32(temp2)} ` +
          `a=${hex32(a)} e=${hex32(e)}`
      );
    }

    logger.info(`${label} compression hoàn tất`);
    logger.note(
      `Post: a=${hex32(a)} b=${hex32(b)} c=${hex32(c)} d=${hex32(d)} ` +
        `e=${hex32(e)} f=${hex32(f)} g=${hex32(g)} h=${hex32(h)}`
    );
    return [a, b, c, d, e, f, g, h];
  }

  static compressSHA224(
    blockWords: number[],
    hashState: number[],
    logger: Logger
  ): number[] {
    return this.compressSHA256(blockWords, hashState, logger, 'SHA-224');
  }

  static compressSHA1(
    blockWords: number[],
    hashState: number[],
    logger: Logger
  ): number[] {
    logger.step(8, 'Thực hiện các vòng nén (SHA-1: 80 rounds)');
    logger.explain(`
SHA-1 dùng 5 working variable a..e và chia 80 round thành 4 đoạn,
mỗi đoạn 20 round dùng hàm f và hằng số K khác nhau:

  t ∈  0..19: f = (b AND c) OR ((NOT b) AND d)           K = 0x5A827999
  t ∈ 20..39: f = b XOR c XOR d                          K = 0x6ED9EBA1
  t ∈ 40..59: f = (b AND c) OR (b AND d) OR (c AND d)    K = 0x8F1BBCDC
  t ∈ 60..79: f = b XOR c XOR d                          K = 0xCA62C1D6

  TEMP = ROTL(a,5) + f + e + K + W[t]   (mod 2^32)
  e = d;  d = c;  c = ROTL(b,30);  b = a;  a = TEMP
`);

    let [a, b, c, d, e] = hashState;
    logger.note(`Init: a=${hex32(a)} b=${hex32(b)} c=${hex32(c)} d=${hex32(d)} e=${hex32(e)}`);
    const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

    for (let i = 0; i < 80; i++) {
      let fVal = 0, k = 0, fName = '';
      if (i < 20) {
        fVal = BitUtils.xor(BitUtils.and(b, c), BitUtils.and(BitUtils.not(b), d));
        k = K[0]; fName = 'Ch    ';
      } else if (i < 40) {
        fVal = BitUtils.xor(b, c, d);
        k = K[1]; fName = 'Parity';
      } else if (i < 60) {
        fVal = BitUtils.xor(BitUtils.and(b, c), BitUtils.and(b, d), BitUtils.and(c, d));
        k = K[2]; fName = 'Maj   ';
      } else {
        fVal = BitUtils.xor(b, c, d);
        k = K[3]; fName = 'Parity';
      }

      const temp = BitUtils.add(BitUtils.leftRotate(a, 5), fVal, e, k, blockWords[i]);
      e = d; d = c; c = BitUtils.leftRotate(b, 30); b = a; a = temp;

      logger.round(
        i, 80,
        `f=${fName} K=${hex32(k)} W=${hex32(blockWords[i])} ` +
          `a=${hex32(a)} b=${hex32(b)} c=${hex32(c)} d=${hex32(d)} e=${hex32(e)}`
      );
    }

    logger.info('SHA-1 compression hoàn tất');
    return [a, b, c, d, e];
  }

  static compressSHA512(
    blockWords: bigint[],
    hashState: bigint[],
    logger: Logger,
    label: string = 'SHA-512'
  ): bigint[] {
    logger.step(8, `Thực hiện các vòng nén (${label}: 80 rounds, 64-bit)`);
    logger.explain(`
${label} tương tự SHA-256 nhưng toán hạng 64-bit và các rotate khác:

  Σ0(a) = ROTR(a,28) XOR ROTR(a,34) XOR ROTR(a,39)
  Σ1(e) = ROTR(e,14) XOR ROTR(e,18) XOR ROTR(e,41)
  Ch(e,f,g)  = (e AND f) XOR ((NOT e) AND g)
  Maj(a,b,c) = (a AND b) XOR (a AND c) XOR (b AND c)

  T1 = h + Σ1(e) + Ch(e,f,g) + K[i] + W[i]
  T2 = Σ0(a) + Maj(a,b,c)
  h=g; g=f; f=e; e=d+T1; d=c; c=b; b=a; a=T1+T2    (mod 2^64)
`);

    let [a, b, c, d, e, f, g, h] = hashState;
    logger.note(`Init: a=${hex64(a)} e=${hex64(e)}`);
    const MASK = 0xffffffffffffffffn;

    for (let i = 0; i < 80; i++) {
      const S1 =
        BitUtils.rotateRight64(e, 14n) ^
        BitUtils.rotateRight64(e, 18n) ^
        BitUtils.rotateRight64(e, 41n);
      const ch = (e & f) ^ (~e & g);
      const K = ConstantsManager.SHA512_CONSTANTS[i];
      const temp1 = (h + S1 + ch + K + blockWords[i]) & MASK;

      const S0 =
        BitUtils.rotateRight64(a, 28n) ^
        BitUtils.rotateRight64(a, 34n) ^
        BitUtils.rotateRight64(a, 39n);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) & MASK;

      h = g; g = f; f = e;
      e = (d + temp1) & MASK;
      d = c; c = b; b = a;
      a = (temp1 + temp2) & MASK;

      logger.round(
        i, 80,
        `K=${hex64(K)} W=${hex64(blockWords[i])} T1=${hex64(temp1)} T2=${hex64(temp2)} ` +
          `a=${hex64(a)} e=${hex64(e)}`
      );
    }

    logger.info(`${label} compression hoàn tất`);
    logger.note(`Post: a=${hex64(a)} b=${hex64(b)} c=${hex64(c)} d=${hex64(d)}`);
    logger.note(`      e=${hex64(e)} f=${hex64(f)} g=${hex64(g)} h=${hex64(h)}`);
    return [a, b, c, d, e, f, g, h];
  }

  static compressSHA384(
    blockWords: bigint[],
    hashState: bigint[],
    logger: Logger
  ): bigint[] {
    return this.compressSHA512(blockWords, hashState, logger, 'SHA-384');
  }
}
