// Parse file .env thủ công — không dùng npm package 'dotenv'.
// Chỉ dùng node:fs (built-in Node.js, không phải thư viện bên ngoài).
import { readFileSync } from 'node:fs';
import { resolve }      from 'node:path';

let loaded = false;

export function loadEnv(): void {
  if (loaded) return;
  loaded = true;

  const envPath = resolve(process.cwd(), '.env');
  let content: string;
  try {
    content = readFileSync(envPath, 'utf8');
  } catch {
    return; // File .env không tồn tại — bỏ qua.
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    // Bỏ qua dòng trống và comment (#).
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;

    const key   = line.slice(0, eq).trim();
    let   value = line.slice(eq + 1).trim();

    // Loại bỏ dấu ngoặc kép hoặc nháy đơn bao quanh.
    if (
      (value.startsWith('"')  && value.endsWith('"'))  ||
      (value.startsWith("'")  && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Chỉ gán nếu biến chưa được set (ưu tiên env của hệ thống).
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
