/**
 * initKeys.ts
 * -----------------------------------------------------------
 * Script sinh khoá ECDH cho bên A và bên B, lưu ra keys/.
 *
 * Chạy: npm run init-keys
 * -----------------------------------------------------------
 */

import { loadConfig } from "../io/index.ts";
import {
  selectDomainParameters,
  describeCurve,
} from "../config/index.ts";
import { generateKeyPair } from "../core/index.ts";
import { saveKeyPair, keyPairExists } from "../io/index.ts";
import { logger } from "../utils/index.ts";

function main(): void {
  logger.section("KHỞI TẠO KHOÁ ECDH (THỦ CÔNG — KHÔNG DÙNG THƯ VIỆN)");

  const cfg = loadConfig();
  const c = selectDomainParameters(cfg.curveName);
  logger.info("Đường cong được chọn:");
  console.log(describeCurve(c));

  if (keyPairExists(cfg.partyA.privateKeyPath, cfg.partyA.publicKeyPath)) {
    logger.info("Bên A đã có khoá — bỏ qua.");
  } else {
    const a = generateKeyPair("A", c);
    saveKeyPair(a, cfg.partyA.privateKeyPath, cfg.partyA.publicKeyPath);
    logger.success("Đã sinh & lưu khoá Bên A");
  }

  if (keyPairExists(cfg.partyB.privateKeyPath, cfg.partyB.publicKeyPath)) {
    logger.info("Bên B đã có khoá — bỏ qua.");
  } else {
    const b = generateKeyPair("B", c);
    saveKeyPair(b, cfg.partyB.privateKeyPath, cfg.partyB.publicKeyPath);
    logger.success("Đã sinh & lưu khoá Bên B");
  }

  console.log("\nHoàn tất. Chạy `npm start` để thực hiện trao đổi ECDH.\n");
}

main();
