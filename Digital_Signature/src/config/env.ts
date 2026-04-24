import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Tự động tìm màng cấu hình từ file .env ở gốc của project Digital_Signature
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export const envConfig = {
  /** 
   * Khóa Private Key Hex được truyền từ .env.
   * Chuyển đổi thành BigInt nếu có.
   */
  ALICE_PRIVATE_KEY: process.env.ALICE_PRIVATE_KEY 
    ? BigInt('0x' + process.env.ALICE_PRIVATE_KEY)
    : undefined,

  /** Thông điệp chuẩn để thử nghiệm hệ thống Ký */
  DEFAULT_MESSAGE: process.env.DEFAULT_MESSAGE || "Message mac dinh tu he thong",

  /** Thông điệp giả mạo dùng trong test Case (Tấn công) */
  TAMPERED_MESSAGE: process.env.TAMPERED_MESSAGE || "Message tan cong default"
};
