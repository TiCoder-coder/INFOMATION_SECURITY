import { ConstantsManager } from '../utils/constants_manager';
import { Logger } from '../utils/logger';

export interface HashState {
  h?: number[];
  h64?: bigint[];
}

export class HashInitializer {
  static initSHA256(logger: Logger): HashState {
    logger.step(6, 'Khởi tạo các giá trị băm ban đầu (SHA-256)');
    const h = [...ConstantsManager.SHA256_INITIAL_VALUES];
    logger.info('SHA-256 Initial Hash Values:');
    h.forEach((val, i) => {
      logger.debug(`h[${i}] = 0x${val.toString(16).padStart(8, '0')}`);
    });
    return { h };
  }

  

  static initSHA224(logger: Logger): HashState {
    logger.step(6, 'Khởi tạo các giá trị băm ban đầu (SHA-224)');
    const h = [...ConstantsManager.SHA224_INITIAL_VALUES];
    logger.info('SHA-224 Initial Hash Values:');
    h.forEach((val, i) => {
      logger.debug(`h[${i}] = 0x${val.toString(16).padStart(8, '0')}`);
    });
    return { h };
  }

  static initSHA1(logger: Logger): HashState {
    logger.step(6, 'Khởi tạo các giá trị băm ban đầu (SHA-1)');
    const h = [...ConstantsManager.SHA1_INITIAL_VALUES];
    logger.info('SHA-1 Initial Hash Values:');
    h.forEach((val, i) => {
      logger.debug(`h[${i}] = 0x${val.toString(16).padStart(8, '0')}`);
    });
    return { h };
  }

  static initSHA512(logger: Logger): HashState {
    logger.step(6, 'Khởi tạo các giá trị băm ban đầu (SHA-512)');
    const h64 = [...ConstantsManager.SHA512_INITIAL_VALUES];
    logger.info('SHA-512 Initial Hash Values:');
    h64.forEach((val, i) => {
      logger.debug(`h[${i}] = 0x${val.toString(16)}`);
    });
    return { h64 };
  }

  static initSHA384(logger: Logger): HashState {
    logger.step(6, 'Khởi tạo các giá trị băm ban đầu (SHA-384)');
    const h64 = [...ConstantsManager.SHA384_INITIAL_VALUES];
    logger.info('SHA-384 Initial Hash Values:');
    h64.forEach((val, i) => {
      logger.debug(`h[${i}] = 0x${val.toString(16)}`);
    });
    return { h64 };
  }
}
