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

    
    const bytes = InputProcessor.process(input, logger);

    
    const paddedBytes = PaddingHandler.padSHA256([...bytes], logger);

    
    const blocks = BlockHandler.split512(paddedBytes, logger);

    
    const initialHash = HashInitializer.initSHA256(logger);
    let hashState = initialHash.h!;

    
    blocks.forEach((block, blockIndex) => {
      logger.info(`\n--- Processing Block ${blockIndex} ---`);

      
      const blockWords = BlockHandler.bytesToWords32(block);
      logger.debug(`Block ${blockIndex} words (32-bit)`, {
        w0_15: blockWords.map((x) => '0x' + x.toString(16).padStart(8, '0')).join(' '),
      });

      
      const expandedWords = WordExpander.expandSHA256(blockWords, logger);

      
      const compressed = CompressionEngine.compressSHA256(expandedWords, hashState, logger);

      
      hashState = HashAggregator.updateSHA256(hashState, compressed, blockIndex, logger);
    });

    
    const hash = HashAggregator.finalizeSHA256(hashState, logger);

    return hash;
  }
}
