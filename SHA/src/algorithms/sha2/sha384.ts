import { InputProcessor } from '../../core/input_processor';
import { PaddingHandler } from '../../core/padding_handler';
import { BlockHandler } from '../../core/block_handler';
import { HashInitializer } from '../../core/hash_initializer';
import { WordExpander } from '../../core/word_expander';
import { CompressionEngine } from '../../core/compression_engine';
import { HashAggregator } from '../../core/hash_aggregator';
import { Logger } from '../../utils/logger';

export class SHA384Encoder {
  static encode(input: string, logger: Logger): string {
    logger.section('SHA-384 ENCODING PROCESS');

    const bytes = InputProcessor.process(input, logger);
    const paddedBytes = PaddingHandler.padSHA512([...bytes], logger);
    const blocks = BlockHandler.split1024(paddedBytes, logger);
    const initialHash = HashInitializer.initSHA384(logger);
    let hashState = initialHash.h64!;

    blocks.forEach((block, blockIndex) => {
      logger.info(`\n--- Processing Block ${blockIndex} ---`);

      const blockWords = BlockHandler.bytesToWords64(block);
      const expandedWords = WordExpander.expandSHA512(blockWords, logger);
      const compressed = CompressionEngine.compressSHA384(expandedWords, hashState, logger);
      hashState = HashAggregator.updateSHA512(hashState, compressed, blockIndex, logger);
    });

    const hash = HashAggregator.finalizeSHA384(hashState, logger);
    return hash;
  }
}
