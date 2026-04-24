/**
 * Input Processor
 * Bước 1: Nhận dữ liệu đầu vào
 * Bước 2: Chuyển dữ liệu sang dạng nhị phân
 */

import { TypeConverter } from '../utils/type_converter';
import { Logger } from '../utils/logger';

export class InputProcessor {
  static process(input: string, logger: Logger): number[] {
    logger.step(1, 'Nhận dữ liệu đầu vào');
    logger.explain(`
Input là một chuỗi Unicode do người dùng nhập. Thuật toán SHA chỉ xử lý
dãy byte, nên bước kế tiếp sẽ mã hoá chuỗi này sang UTF-8 để mỗi ký tự
được biểu diễn bằng 1-4 byte.
`);
    logger.info(`Input string: "${input}"`);
    logger.info(`Input length (ký tự): ${input.length}`);

    logger.step(2, 'Chuyển dữ liệu sang dạng nhị phân (UTF-8)');
    logger.explain(`
Mỗi ký tự Unicode được mã hoá UTF-8:
  • ASCII (U+0000..U+007F)        → 1 byte
  • Latin mở rộng (U+0080..U+07FF) → 2 byte
  • Ký tự Việt, CJK (U+0800..U+FFFF) → 3 byte
  • Emoji, ký tự hiếm             → 4 byte
Kết quả là mảng byte (0..255) sẽ được dùng làm input thô cho SHA.
`);
    const bytes = TypeConverter.stringToBytes(input);

    logger.info(`Total bytes (sau UTF-8): ${bytes.length}`);
    logger.info(`Bytes (decimal): ${bytes.join(', ')}`);
    logger.hex('Bytes (hex)    ', TypeConverter.bytesToHex(bytes));
    logger.binary('Bytes (binary) ', TypeConverter.bytesToBinary(bytes));

    // In bảng mapping ký tự → byte để dễ theo dõi
    logger.note('Mapping ký tự → UTF-8 byte:');
    let idx = 0;
    for (const ch of input) {
      const codePoint = ch.codePointAt(0)!;
      let nBytes = 1;
      if (codePoint >= 0x10000) nBytes = 4;
      else if (codePoint >= 0x800) nBytes = 3;
      else if (codePoint >= 0x80) nBytes = 2;
      const chBytes: number[] = [];
      for (let k = 0; k < nBytes; k++) chBytes.push(bytes[idx + k]);
      idx += nBytes;
      logger.note(
        `  '${ch}' U+${codePoint.toString(16).toUpperCase().padStart(4, '0')} → ` +
          chBytes.map((b) => '0x' + b.toString(16).padStart(2, '0')).join(' ')
      );
    }

    return bytes;
  }
}
