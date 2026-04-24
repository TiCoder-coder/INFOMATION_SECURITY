import { InputHandler } from './input_handler';
import { OutputDisplay } from './output_display';
import { AlgorithmSelector } from './algorithm_selector';
import { Logger } from '../utils/logger';
import { SHA1Encoder } from '../algorithms/sha1/encoder';
import { SHA224Encoder } from '../algorithms/sha2/sha224';
import { SHA256Encoder } from '../algorithms/sha2/sha256';
import { SHA384Encoder } from '../algorithms/sha2/sha384';
import { SHA512Encoder } from '../algorithms/sha2/sha512';
import { SHA3_256Encoder } from '../algorithms/sha3/sha3_256';
import { SHA3_384Encoder } from '../algorithms/sha3/sha3_384';
import { SHA3_512Encoder } from '../algorithms/sha3/sha3_512';

export class UserInterface {
  async run(): Promise<void> {
    OutputDisplay.displayWelcome();

    const inputHandler = new InputHandler();
    const logger = new Logger();

    try {
      // Step 1: Select Main Algorithm
      AlgorithmSelector.displayMainMenu();
      const mainChoice = await inputHandler.selectNumber(1, 3, 'Chọn thuật toán (1-3): ');
      const mainAlgo = AlgorithmSelector.MAIN_ALGORITHMS[mainChoice - 1];

      // Step 2: Select Variant
      const variants = AlgorithmSelector.displayVariants(mainAlgo.id);
      if (!variants) {
        OutputDisplay.displayError('Không có biến thể cho thuật toán này');
        inputHandler.close();
        return;
      }

      const variantChoice = await inputHandler.selectNumber(1, variants.length, 'Chọn biến thể (1-' + variants.length + '): ');
      const selectedVariant = variants[variantChoice - 1];

      // Step 3: Get Input
      const inputString = await inputHandler.getInputString();

      // Step 4: Encode
      logger.info(`=== Starting ${selectedVariant.name} encoding ===`);
      let hash = '';

      console.log('\nĐang xử lý...\n');

      switch (selectedVariant.id) {
        case 'sha1':
          hash = SHA1Encoder.encode(inputString, logger);
          break;
        case 'sha224':
          hash = SHA224Encoder.encode(inputString, logger);
          break;
        case 'sha256':
          hash = SHA256Encoder.encode(inputString, logger);
          break;
        case 'sha384':
          hash = SHA384Encoder.encode(inputString, logger);
          break;
        case 'sha512':
          hash = SHA512Encoder.encode(inputString, logger);
          break;
        case 'sha3_256':
          hash = SHA3_256Encoder.encode(inputString, logger);
          break;
        case 'sha3_384':
          hash = SHA3_384Encoder.encode(inputString, logger);
          break;
        case 'sha3_512':
          hash = SHA3_512Encoder.encode(inputString, logger);
          break;
        default:
          OutputDisplay.displayError('Thuật toán không được hỗ trợ');
          inputHandler.close();
          return;
      }

      // Step 5: Display Result
      OutputDisplay.displayResult(selectedVariant.name, inputString, hash, logger.getLogPath());
      logger.summary(selectedVariant.name, inputString, hash);
    } catch (error) {
      if (error instanceof Error) {
        OutputDisplay.displayError(error.message);
        logger.error('Error occurred', error);
      }
    } finally {
      logger.close();
      inputHandler.close();
    }
  }
}
