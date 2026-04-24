/**
 * SHA-3-384 Encoder
 */

import { InputProcessor } from '../../core/input_processor';
import { Logger } from '../../utils/logger';
import { Keccak256Operations } from './operations';
import { KECCAK_ROUND_CONSTANTS, KECCAK_ROTATION_OFFSETS, SHA3_CONFIG } from './constants';
import { TypeConverter } from '../../utils/type_converter';

export class SHA3_384Encoder {
  static encode(input: string, logger: Logger): string {
    logger.section('SHA3-384 ENCODING PROCESS');
    logger.explain(`
SHA3-384 giống SHA3-256 về cấu trúc (sponge + Keccak-f[1600]) nhưng:
  • Rate r = 832 bit (104 byte)
  • Capacity c = 768 bit
  • Output = 384 bit (48 byte)
Capacity lớn hơn → mức an toàn cao hơn nhưng block nhỏ hơn → chạy chậm hơn.
`);

    const bytes = InputProcessor.process(input, logger);

    logger.step(3, 'SHA3 Domain Separation & Padding (pad10*1)');
    const config = SHA3_CONFIG.SHA3_384;
    logger.info(`Rate r = ${config.blockSize} bit = ${config.blockSize / 8} byte`);
    logger.info(`Capacity c = ${config.capacity} bit`);
    logger.info('Domain separation byte: 0x06');

    logger.step(4, 'Khởi tạo Keccak-f[1600] state (ma trận 5×5×64-bit)');
    let state: bigint[][] = Array(5).fill(null).map(() => Array(5).fill(0n));
    logger.matrix5x5('Initial state (zeros)', state);

    logger.step(5, 'ABSORBING PHASE');
    const blockSizeBytes = config.blockSize / 8;
    const paddedMessage = this.pad10_1(new Uint8Array(bytes), blockSizeBytes);
    logger.info(`Message gốc: ${bytes.length} byte`);
    logger.info(`Sau pad10*1: ${paddedMessage.length} byte`);
    logger.hex('Padded message (hex)', TypeConverter.bytesToHex(Array.from(paddedMessage)));

    const numBlocks = Math.ceil(paddedMessage.length / blockSizeBytes);
    logger.info(`Số block: ${numBlocks}`);

    for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
      const block = paddedMessage.slice(blockIdx * blockSizeBytes, (blockIdx + 1) * blockSizeBytes);
      logger.info(`\n━━━ Block ${blockIdx} (${block.length} byte) ━━━`);
      logger.hex(`Block ${blockIdx} (hex)`, TypeConverter.bytesToHex(Array.from(block)));

      this.xorBlockIntoState(state, block);
      logger.matrix5x5(`State sau XOR block ${blockIdx}`, state);

      logger.info(`Chạy Keccak-f[1600] — 24 rounds:`);
      for (let round = 0; round < 24; round++) {
        state = Keccak256Operations.roundVerbose(
          state,
          KECCAK_ROUND_CONSTANTS[round],
          KECCAK_ROTATION_OFFSETS,
          logger,
          round,
          blockIdx === 0
        );
        if (blockIdx !== 0) {
          logger.matrix5x5(`State sau round ${round.toString().padStart(2, '0')}`, state);
        }
      }
    }

    logger.step(7, 'SQUEEZING PHASE');
    const outputSize = config.outputSize / 8;
    let output = new Uint8Array(0);

    while (output.length < outputSize) {
      const stateBytes = this.stateToBytes(state, blockSizeBytes);
      const remaining = outputSize - output.length;
      const toAdd = Math.min(remaining, stateBytes.length);
      output = new Uint8Array([...output, ...stateBytes.slice(0, toAdd)]);

      if (output.length < outputSize) {
        logger.info('Output chưa đủ → chạy Keccak-f[1600] thêm 1 lượt');
        for (let round = 0; round < 24; round++) {
          state = Keccak256Operations.round(state, KECCAK_ROUND_CONSTANTS[round], KECCAK_ROTATION_OFFSETS);
        }
      }
    }

    logger.hex('Output bytes', TypeConverter.bytesToHex(Array.from(output)));

    logger.step(9, 'Chuyển đổi output sang hex');
    const hash = TypeConverter.bytesToHex(Array.from(output));
    logger.result('SHA3-384 Hash Output', hash);

    return hash;
  }

  private static pad10_1(message: Uint8Array, blockSize: number): Uint8Array {
    const messageLength = message.length;
    const paddingLength = blockSize - (messageLength % blockSize);
    const paddedMessage = new Uint8Array(messageLength + paddingLength);
    paddedMessage.set(message);
    paddedMessage[messageLength] = 0x06;
    paddedMessage[paddedMessage.length - 1] |= 0x80;
    return paddedMessage;
  }

  private static xorBlockIntoState(state: bigint[][], block: Uint8Array): void {
    let byteIndex = 0;
    for (let y = 0; y < 5 && byteIndex < block.length; y++) {
      for (let x = 0; x < 5 && byteIndex < block.length; x++) {
        let lane = 0n;
        for (let z = 0; z < 8 && byteIndex < block.length; z++) {
          lane |= BigInt(block[byteIndex++]) << BigInt(z * 8);
        }
        state[x][y] ^= lane;
      }
    }
  }

  private static stateToBytes(state: bigint[][], blockSize: number): Uint8Array {
    const bytes = new Uint8Array(blockSize);
    let byteIndex = 0;
    for (let y = 0; y < 5 && byteIndex < blockSize; y++) {
      for (let x = 0; x < 5 && byteIndex < blockSize; x++) {
        let lane = state[x][y];
        for (let z = 0; z < 8 && byteIndex < blockSize; z++) {
          bytes[byteIndex++] = Number((lane >> BigInt(z * 8)) & 0xffn);
        }
      }
    }
    return bytes;
  }
}
