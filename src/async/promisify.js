import { promisify } from 'util';

/**
 * @module promisifier
 */

/**
  * The promisifier class
  * @class
  */
class Promisifier {
  /**
   * Generates a promisified function against a callback function
   * @param {Function} func - the callback function
   * @return {Function} the promisifed function
   */
  static promisify(func) {
    return promisify(func);
  }
}

export default Promisifier.promisify;
export { Promisifier };
