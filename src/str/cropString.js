import stringify from './stringify';

/**
 * @module stringCroper
 */

class StringCroper {
  /**
   * Crop a string
   * @param {String} str - the input string
   * @param {Number} [len=100] - length of final string
   * @return {String} the new cropped string
   */
  static crop(str, len = 100) {
    const st = stringify(str);
    return (st.length > len) ? `${st.substring(0, len - 4)}...` : st;
  }
}

export default StringCroper.crop;
export { StringCroper };
