// Load cặp khóa receiver tĩnh từ .env (nếu có). Trả về undefined khi không cấu hình.
import type { DomainParameters } from '../domain/types/domain-parameters';
import type { KeyPair } from '../keys/types/key-types';
import { getEnvOptional } from './get-env';

export function loadReceiverKeyPairFromEnv(params: DomainParameters): KeyPair | undefined {
  const d = getEnvOptional('RECEIVER_PRIVATE_KEY');
  const qx = getEnvOptional('RECEIVER_PUBLIC_KEY_X');
  const qy = getEnvOptional('RECEIVER_PUBLIC_KEY_Y');
  if (!d || !qx || !qy) return undefined;
  return {
    privateKey: BigInt('0x' + d),
    publicKey: {
      Q: { infinity: false, x: BigInt('0x' + qx), y: BigInt('0x' + qy) },
      params,
    },
  };
}
