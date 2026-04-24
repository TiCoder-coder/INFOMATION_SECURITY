// Hàm dùng để chuyển đổi từ string -> byte array, byte array -> hex string,...
export function stringToBytes(str: string): number[] {
  return Array.from(Buffer.from(str, 'utf-8'));
}

export function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return bytes;
}

export function bytesToBase64(bytes: number[]): string {
  return Buffer.from(bytes).toString('base64');
}

export function stateToHexMatrix(state: number[][]): string[][] {
  return state.map(row => row.map(b => b.toString(16).padStart(2, '0')));
}
