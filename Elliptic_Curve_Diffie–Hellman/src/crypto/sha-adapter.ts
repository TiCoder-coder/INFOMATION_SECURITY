import { PaddingHandler }    from '../../../SHA/src/core/padding_handler';
import { BlockHandler }      from '../../../SHA/src/core/block_handler';
import { HashInitializer }   from '../../../SHA/src/core/hash_initializer';
import { WordExpander }      from '../../../SHA/src/core/word_expander';
import { CompressionEngine } from '../../../SHA/src/core/compression_engine';
import { HashAggregator }    from '../../../SHA/src/core/hash_aggregator';
import { Logger }            from '../../../SHA/src/utils/logger';

const _logger: Logger = Object.assign(
  Object.create(Logger.prototype) as Logger,
  {
    info:       () => {},
    debug:      () => {},
    error:      () => {},
    section:    () => {},
    step:       () => {},
    hex:        () => {},
    binary:     () => {},
    array:      () => {},
    explain:    () => {},
    formula:    () => {},
    subStep:    () => {},
    note:       () => {},
    matrix5x5:  () => {},
    round:      () => {},
    result:     () => {},
    summary:    () => {},
    getLogPath: () => '',
  }
);

function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}

export function sha256(data: Buffer): Buffer {
  const bytes     = Array.from(data);
  const padded    = PaddingHandler.padSHA256([...bytes], _logger);
  const blocks    = BlockHandler.split512(padded, _logger);
  const initState = HashInitializer.initSHA256(_logger);
  let hashState   = initState.h!;

  for (let i = 0; i < blocks.length; i++) {
    const words      = BlockHandler.bytesToWords32(blocks[i]);
    const expanded   = WordExpander.expandSHA256(words, _logger);
    const compressed = CompressionEngine.compressSHA256(expanded, hashState, _logger);
    hashState        = HashAggregator.updateSHA256(hashState, compressed, i, _logger);
  }

  const hexResult = HashAggregator.finalizeSHA256(hashState, _logger);
  return hexToBuffer(hexResult); 
}
