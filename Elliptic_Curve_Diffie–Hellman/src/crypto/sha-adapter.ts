// sha-adapter.ts
// ─────────────────────────────────────────────────────────────────────────────
// Adapter để ECDH project gọi SHA logic từ SHA project (sibling directory).
// Không thay đổi bất kỳ file nào trong SHA project.
//
// Vấn đề API:
//   SHA project : SHA256Encoder.encode(input: string, logger: Logger): string
//   ECDH cần    : sha256(data: Buffer): Buffer
//
// Giải pháp: tạo silentLogger (object thỏa giao diện Logger nhưng no-op)
// rồi gọi trực tiếp các core modules của SHA project với data đã convert.
// ─────────────────────────────────────────────────────────────────────────────

import { PaddingHandler }    from '../../../SHA/src/core/padding_handler';
import { BlockHandler }      from '../../../SHA/src/core/block_handler';
import { HashInitializer }   from '../../../SHA/src/core/hash_initializer';
import { WordExpander }      from '../../../SHA/src/core/word_expander';
import { CompressionEngine } from '../../../SHA/src/core/compression_engine';
import { HashAggregator }    from '../../../SHA/src/core/hash_aggregator';
import { Logger }            from '../../../SHA/src/utils/logger';

// ─── Silent Logger ───────────────────────────────────────────────────────────
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

// ─── Helper: hex string → Buffer ───────────────────────────────────────────
function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}

// ─── SHA-256 via SHA project ──────────────────────────────────────────────────
/**
 * SHA-256 — delegates toàn bộ logic sang SHA project.
 *
 * @param data  Dữ liệu cần băm (Buffer)
 * @returns     32-byte Buffer chứa SHA-256 digest
 */
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
  return hexToBuffer(hexResult); // 32 bytes
}
