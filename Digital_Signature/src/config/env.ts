import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export const envConfig = {
  

  ALICE_PRIVATE_KEY: process.env.ALICE_PRIVATE_KEY 
    ? BigInt('0x' + process.env.ALICE_PRIVATE_KEY)
    : undefined,

  
  DEFAULT_MESSAGE: process.env.DEFAULT_MESSAGE || "Message mac dinh tu he thong",

  
  TAMPERED_MESSAGE: process.env.TAMPERED_MESSAGE || "Message tan cong default"
};
