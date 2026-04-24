/**
 * Hash Aggregator
 * Bước 9: Cập nhật giá trị băm trung gian
 * Bước 10: Ghép kết quả cuối cùng
 */

import { BitUtils } from '../utils/bit_utils';
import { TypeConverter } from '../utils/type_converter';
import { Logger } from '../utils/logger';

export class HashAggregator {
  /**
   * Cập nhật hash state cho SHA-256
   * Bước 9 & 10: Cộng giá trị đã nén vào hash state
   */
  static updateSHA256(
    hashState: number[],
    compressed: number[],
    blockIndex: number,
    logger: Logger
  ): number[] {
    logger.step(9, `Cập nhật giá trị băm (Block ${blockIndex})`);

    const newState = hashState.map((val, i) => BitUtils.add(val, compressed[i]));

    logger.debug(`Hash values after block ${blockIndex}:`, {
      h: newState.map((x) => '0x' + x.toString(16).padStart(8, '0')).join(' '),
    });

    return newState;
  }

  /**
   * Cập nhật hash state cho SHA-1
   */
  static updateSHA1(
    hashState: number[],
    compressed: number[],
    blockIndex: number,
    logger: Logger
  ): number[] {
    logger.step(9, `Cập nhật giá trị băm (Block ${blockIndex})`);

    const newState = hashState.map((val, i) => BitUtils.add(val, compressed[i]));

    logger.debug(`Hash values after block ${blockIndex}:`, {
      h: newState.map((x) => '0x' + x.toString(16).padStart(8, '0')).join(' '),
    });

    return newState;
  }

  /**
   * Cập nhật hash state cho SHA-512
   */
  static updateSHA512(
    hashState: bigint[],
    compressed: bigint[],
    blockIndex: number,
    logger: Logger
  ): bigint[] {
    logger.step(9, `Cập nhật giá trị băm (Block ${blockIndex})`);

    const newState = hashState.map((val, i) => (val + compressed[i]) & 0xffffffffffffffffn);

    logger.debug(`Hash values after block ${blockIndex}`);

    return newState;
  }

  /**
   * Bước 10: Ghép kết quả cuối cùng SHA-256
   */
  static finalizeSHA256(hashState: number[], logger: Logger): string {
    logger.step(10, 'Ghép kết quả cuối cùng (SHA-256)');

    const hashHex = TypeConverter.wordsToHex(hashState);
    logger.result('SHA-256 Hash Output', hashHex);

    return hashHex;
  }

  /**
   * Bước 10: Ghép kết quả cuối cùng SHA-224
   */
  static finalizeSHA224(hashState: number[], logger: Logger): string {
    logger.step(10, 'Ghép kết quả cuối cùng (SHA-224)');

    // SHA-224 chỉ dùng 7 words (28 bytes) từ 8 words
    const hash224State = hashState.slice(0, 7);
    const hashHex = TypeConverter.wordsToHex(hash224State);
    logger.result('SHA-224 Hash Output', hashHex);

    return hashHex;
  }

  /**
   * Bước 10: Ghép kết quả cuối cùng SHA-1
   */
  static finalizeSHA1(hashState: number[], logger: Logger): string {
    logger.step(10, 'Ghép kết quả cuối cùng (SHA-1)');

    const hashHex = TypeConverter.wordsToHex(hashState);
    logger.result('SHA-1 Hash Output', hashHex);

    return hashHex;
  }

  /**
   * Bước 10: Ghép kết quả cuối cùng SHA-512
   */
  static finalizeSHA512(hashState: bigint[], logger: Logger): string {
    logger.step(10, 'Ghép kết quả cuối cùng (SHA-512)');

    const hashHex = hashState
      .map((w) => ('0000000000000000' + w.toString(16)).slice(-16))
      .join('');
    logger.result('SHA-512 Hash Output', hashHex);

    return hashHex;
  }

  /**
   * Bước 10: Ghép kết quả cuối cùng SHA-384
   */
  static finalizeSHA384(hashState: bigint[], logger: Logger): string {
    logger.step(10, 'Ghép kết quả cuối cùng (SHA-384)');

    // SHA-384 chỉ dùng 6 words (48 bytes) từ 8 words
    const hash384State = hashState.slice(0, 6);
    const hashHex = hash384State.map((w) => ('0000000000000000' + w.toString(16)).slice(-16)).join('');
    logger.result('SHA-384 Hash Output', hashHex);

    return hashHex;
  }
}
