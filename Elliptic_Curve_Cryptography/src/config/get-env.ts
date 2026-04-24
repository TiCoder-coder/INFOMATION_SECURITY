// Helper đọc biến môi trường với kiểm tra bắt buộc và parse.
import { loadEnv } from './load-env';

export function getEnv(key: string, required = true): string {
  loadEnv();
  const v = process.env[key];
  if ((v === undefined || v === '') && required) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return v ?? '';
}

export function getEnvHex(key: string): bigint {
  const v = getEnv(key);
  return BigInt('0x' + v);
}

export function getEnvInt(key: string): bigint {
  const v = getEnv(key);
  return BigInt(v);
}

export function getEnvOptional(key: string): string | undefined {
  loadEnv();
  const v = process.env[key];
  return v && v !== '' ? v : undefined;
}
