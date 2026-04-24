import {
  generateSchnorrKeyPair,
  schnorrSign,
  schnorrVerify,
  secp256k1
} from '../index';
import { SchnorrLogger } from '../utils/schnorr-logger';
import { envConfig } from '../config/env';
import { scalarMultiply } from '../ecc-proxy';

const textEncoder = new TextEncoder();
const logger = new SchnorrLogger();

console.log(`\n📄[INFO] Da tao File Log chi tiet tai: ${logger.path}\n`);

logger.section("DEMO: CHU KY SO SCHNORR (SECP256K1) QUY MO MICRO-ARCHITECTURE");

// 1. SINH KHOA
logger.stepLog("HE THONG DANG TAO KHOA P=d*G CHO ALICE...");

let aliceKeys;
if (envConfig.ALICE_PRIVATE_KEY) {
  logger.kv('Nguon khoa', 'Su dung Private Key tu file .env');
  const d = envConfig.ALICE_PRIVATE_KEY;
  const P = scalarMultiply(d, secp256k1.G, secp256k1);
  aliceKeys = { privateKey: d, publicKey: P };
} else {
  logger.kv('Nguon khoa', 'Tu dong sinh ngau nhien (Random)');
  aliceKeys = generateSchnorrKeyPair(secp256k1);
}

logger.hex('Alice Private Key (d)', aliceKeys.privateKey);

if (!aliceKeys.publicKey.infinity) {
  logger.hex('Alice Public Key (P.x)', aliceKeys.publicKey.x);
  logger.hex('Alice Public Key (P.y)', aliceKeys.publicKey.y);
} else {
  logger.kv('Alice Public Key', 'Infinity Point');
}

// 2. KY THONG DIEP
const defaultMessage = envConfig.DEFAULT_MESSAGE;
logger.subsection("ALICE TIEN HANH KY THONG DIEP CHUAN...");
logger.kv('Ban tin (m)', `"${defaultMessage}"`);

const messageBytes = textEncoder.encode(defaultMessage);
const signature = schnorrSign(messageBytes, aliceKeys.privateKey, secp256k1, logger);

logger.subsection("Chu ky tao ra (Sig = (R, s)):");
if (!signature.R.infinity) {
  logger.hex('Diem R (X)', signature.R.x);
} else {
  logger.kv('Diem R', 'Infinity');
}
logger.hex('Gia tri (s)', signature.s);

// 3. XAC MINH HOP LE
logger.subsection("BOB XAC MINH CHU KY (VOI BAN TIN GOC)...");
const isDefaultValid = schnorrVerify(messageBytes, signature, aliceKeys.publicKey, secp256k1, logger);
if (isDefaultValid) {
  logger.stepLog('KET QUA CUOI CUNG', '"Hop le" - Chu ky chuan xac 100%!');
} else {
  logger.stepLog('KET QUA CUOI CUNG', '"Khong hop le"!');
}

// 4. KE TAN CONG THAY DOI DU LIEU
logger.subsection("TIN TAC (EVE) CAN THIEP GIAN LAN THONG DIEP...");
const tamperedMessage = envConfig.TAMPERED_MESSAGE;
logger.kv("Ban tin bi can thiep (m')", `"${tamperedMessage}"`);

const tamperedBytes = textEncoder.encode(tamperedMessage);

logger.subsection("BOB XAC MINH LAI VOI BAN TIN BI SUA...");
const isTamperedValid = schnorrVerify(tamperedBytes, signature, aliceKeys.publicKey, secp256k1, logger);
if (isTamperedValid) {
  logger.stepLog('KET QUA CUOI CUNG', '"Hop le" (Nguy hiem)!');
} else {
  logger.stepLog('KET QUA CUOI CUNG', '"Khong hop le" - Toan hoc da chan dung Eve thanh cong!');
}

logger.line("\n==============================================================");
process.exit(0);
