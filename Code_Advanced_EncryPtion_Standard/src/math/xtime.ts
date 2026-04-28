export function xtime(a: number): number {
  return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0x00)) & 0xff;
}
