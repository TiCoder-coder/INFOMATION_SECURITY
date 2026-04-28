import { TypeConverter } from '../utils/type_converter';
import { Logger } from '../utils/logger';

export class BlockHandler {
  

  static split512(bytes: number[], logger: Logger): number[][] {
    logger.step(5, 'Chia dữ liệu thành các block (512 bits = 64 bytes)');

    const blockSize = 64; 
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

  static split1024(bytes: number[], logger: Logger): number[][] {
    logger.step(5, 'Chia dữ liệu thành các block (1024 bits = 128 bytes)');

    const blockSize = 128; 
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

  static bytesToWords32(block: number[]): number[] {
    return TypeConverter.bytesToWords(block);
  }

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
