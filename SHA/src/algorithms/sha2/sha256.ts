import { InputProcessor } from '../../core/input_processor';
import { PaddingHandler } from '../../core/padding_handler';
import { BlockHandler } from '../../core/block_handler';
import { HashInitializer } from '../../core/hash_initializer';
import { WordExpander } from '../../core/word_expander';
import { CompressionEngine } from '../../core/compression_engine';
import { HashAggregator } from '../../core/hash_aggregator';
import { Logger } from '../../utils/logger';

export class SHA256Encoder {
  static encode(input: string, logger: Logger): string {
    logger.section('SHA-256 ENCODING PROCESS');

    // Bước 1-2: Input Processing
    const bytes = InputProcessor.process(input, logger);

    // Bước 3-4: Padding
    const paddedBytes = PaddingHandler.padSHA256([...bytes], logger);

    // Bước 5: Block Handler
    const blocks = BlockHandler.split512(paddedBytes, logger);

    // Bước 6: Hash Initializer
    const initialHash = HashInitializer.initSHA256(logger);
    let hashState = initialHash.h!;

    // Xử lý từng block
    blocks.forEach((block, blockIndex) => {
      logger.info(`\n--- Processing Block ${blockIndex} ---`);

      // Bước 5 (tiếp): Chuyển bytes block thành words
      const blockWords = BlockHandler.bytesToWords32(block);
      logger.debug(`Block ${blockIndex} words (32-bit)`, {
        w0_15: blockWords.map((x) => '0x' + x.toString(16).padStart(8, '0')).join(' '),
      });

      // Bước 7: Word Expander
      const expandedWords = WordExpander.expandSHA256(blockWords, logger);

      // Bước 8: Compression Engine
      const compressed = CompressionEngine.compressSHA256(expandedWords, hashState, logger);

      // Bước 9: Hash Aggregator - Update hash state
      hashState = HashAggregator.updateSHA256(hashState, compressed, blockIndex, logger);
    });

    // Bước 10: Finalize
    const hash = HashAggregator.finalizeSHA256(hashState, logger);

    return hash;
  }
}
