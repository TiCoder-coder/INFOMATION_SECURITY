export class TypeConverter {
  

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

  static bytesToWords(bytes: number[]): number[] {
    const words: number[] = [];
    for (let i = 0; i < bytes.length; i += 4) {
      let word = 0;
      for (let j = 0; j < 4 && i + j < bytes.length; j++) {
        word = (word << 8) | bytes[i + j];
      }
      word = word >>> 0; 
      words.push(word);
    }
    return words;
  }

  static wordToBytes(word: number): number[] {
    return [
      (word >>> 24) & 0xff,
      (word >>> 16) & 0xff,
      (word >>> 8) & 0xff,
      word & 0xff,
    ];
  }

  static hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  static bytesToHex(bytes: number[]): string {
    return bytes.map((b) => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
  }

  static wordsToHex(words: number[]): string {
    return words.map((w) => ('00000000' + (w >>> 0).toString(16)).slice(-8)).join('');
  }

  static bytesToBinary(bytes: number[]): string {
    return bytes
      .map((b) => ('00000000' + (b >>> 0).toString(2)).slice(-8))
      .join('');
  }
}
