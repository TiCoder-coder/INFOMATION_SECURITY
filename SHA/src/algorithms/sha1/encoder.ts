import { InputProcessor } from '../../core/input_processor';
import { PaddingHandler } from '../../core/padding_handler';
import { BlockHandler } from '../../core/block_handler';
import { HashInitializer } from '../../core/hash_initializer';
import { WordExpander } from '../../core/word_expander';
import { CompressionEngine } from '../../core/compression_engine';
import { HashAggregator } from '../../core/hash_aggregator';
import { Logger } from '../../utils/logger';

export class SHA1Encoder {
  static encode(input: string, logger: Logger): string {
    logger.section('SHA-1 ENCODING PROCESS');

    const bytes = InputProcessor.process(input, logger);
    const paddedBytes = PaddingHandler.padSHA1([...bytes], logger);
    const blocks = BlockHandler.split512(paddedBytes, logger);
    const initialHash = HashInitializer.initSHA1(logger);
    let hashState = initialHash.h!;

    blocks.forEach((block, blockIndex) => {
      logger.info(`\n--- Processing Block ${blockIndex} ---`);

      const blockWords = BlockHandler.bytesToWords32(block);
      const expandedWords = WordExpander.expandSHA1(blockWords, logger);
      const compressed = CompressionEngine.compressSHA1(expandedWords, hashState, logger);
      hashState = HashAggregator.updateSHA1(hashState, compressed, blockIndex, logger);
    });

    const hash = HashAggregator.finalizeSHA1(hashState, logger);
    return hash;
  }
}
