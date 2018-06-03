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
  static crop(str, len) {
    const st = stringify(str);
    return (st.length > ln) ? `${st.substring(0, ln - 4)}...` : st;
  }
}

export default StringCroper.crop;
export { StringCroper };
