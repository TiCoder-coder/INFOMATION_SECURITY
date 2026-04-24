/**
 * Type Converter - Chuyển đổi kiểu dữ liệu
 */

export class TypeConverter {
  /**
   * Chuyển string sang byte array (UTF-8)
   * Bước 2: Chuyển dữ liệu sang dạng nhị phân.
   *
   * Iterate theo Unicode code point (dùng `for..of`) để xử lý đúng
   * surrogate pair (emoji, ký tự ngoài BMP như U+1F510). Nếu dùng
   * `charCodeAt` sẽ trả về 2 code unit 16-bit riêng biệt cho emoji
   * → UTF-8 bytes sai → hash sai.
   */
  static stringToBytes(str: string): number[] {
    const bytes: number[] = [];
    for (const ch of str) {
      const code = ch.codePointAt(0)!;
      if (code <= 0x7f) {
        bytes.push(code);
      } else if (code <= 0x7ff) {
        bytes.push(0xc0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3f));
      } else if (code <= 0xffff) {
        bytes.push(0xe0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      } else {
        bytes.push(0xf0 | (code >> 18));
        bytes.push(0x80 | ((code >> 12) & 0x3f));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      }
    }
    return bytes;
  }

  /**
   * Chuyển byte array sang array of 32-bit words
   * 4 bytes = 1 word (32-bit)
   */
  static bytesToWords(bytes: number[]): number[] {
    const words: number[] = [];
    for (let i = 0; i < bytes.length; i += 4) {
      let word = 0;
      for (let j = 0; j < 4 && i + j < bytes.length; j++) {
        word = (word << 8) | bytes[i + j];
      }
      word = word >>> 0; // Ensure 32-bit unsigned
      words.push(word);
    }
    return words;
  }

  /**
   * Chuyển 32-bit word sang 4 bytes
   */
  static wordToBytes(word: number): number[] {
    return [
      (word >>> 24) & 0xff,
      (word >>> 16) & 0xff,
      (word >>> 8) & 0xff,
      word & 0xff,
    ];
  }

  /**
   * Chuyển hex string sang bytes
   */
  static hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  /**
   * Chuyển bytes sang hex string
   */
  static bytesToHex(bytes: number[]): string {
    return bytes.map((b) => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
  }

  /**
   * Chuyển array of 32-bit words sang hex string
   */
  static wordsToHex(words: number[]): string {
    return words.map((w) => ('00000000' + (w >>> 0).toString(16)).slice(-8)).join('');
  }

  /**
   * Chuyển byte array sang binary string
   */
  static bytesToBinary(bytes: number[]): string {
    return bytes
      .map((b) => ('00000000' + (b >>> 0).toString(2)).slice(-8))
      .join('');
  }
}
