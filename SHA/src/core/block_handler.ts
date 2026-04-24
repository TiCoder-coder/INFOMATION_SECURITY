/**
 * Block Handler
 * Bước 5: Chia dữ liệu thành các block cố định
 */

import { TypeConverter } from '../utils/type_converter';
import { Logger } from '../utils/logger';

export class BlockHandler {
  /**
   * Chia thành blocks 512-bit (64 bytes) - dùng cho SHA-256, SHA-224, SHA-1
   */
  static split512(bytes: number[], logger: Logger): number[][] {
    logger.step(5, 'Chia dữ liệu thành các block (512 bits = 64 bytes)');

    const blockSize = 64; // 512 bits = 64 bytes
    const blocks: number[][] = [];

    for (let i = 0; i < bytes.length; i += blockSize) {
      const block = bytes.slice(i, i + blockSize);
      blocks.push(block);
    }

    logger.info(`Total blocks: ${blocks.length}`);
    blocks.forEach((block, index) => {
      logger.debug(`Block ${index}: ${block.length} bytes`, {
        hex: TypeConverter.bytesToHex(block),
      });
    });

    return blocks;
  }

  /**
   * Chia thành blocks 1024-bit (128 bytes) - dùng cho SHA-512, SHA-384
   */
  static split1024(bytes: number[], logger: Logger): number[][] {
    logger.step(5, 'Chia dữ liệu thành các block (1024 bits = 128 bytes)');

    const blockSize = 128; // 1024 bits = 128 bytes
    const blocks: number[][] = [];

    for (let i = 0; i < bytes.length; i += blockSize) {
      const block = bytes.slice(i, i + blockSize);
      blocks.push(block);
    }

    logger.info(`Total blocks: ${blocks.length}`);
    blocks.forEach((block, index) => {
      logger.debug(`Block ${index}: ${block.length} bytes`);
    });

    return blocks;
  }

  /**
   * Convert bytes block thành words (32-bit)
   */
  static bytesToWords32(block: number[]): number[] {
    return TypeConverter.bytesToWords(block);
  }

  /**
   * Convert bytes block thành BigInt words (64-bit) - dùng cho SHA-512/384
   */
  static bytesToWords64(block: number[]): bigint[] {
    const words: bigint[] = [];
    for (let i = 0; i < block.length; i += 8) {
      let word = 0n;
      for (let j = 0; j < 8 && i + j < block.length; j++) {
        word = (word << 8n) | BigInt(block[i + j] & 0xff);
      }
      words.push(word);
    }
    return words;
  }
}
