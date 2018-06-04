
/**
 * @module builtin
 */

/**
  * The builtin class, which contains methods for js builtin methods
  * @class
  */
class BuiltIn {
  /**
   * if a builtin
   * @param {val} val - the input value
   * @return {boolean} whether a builtin
   */
  static isBuiltIn(val) {
    return (val instanceof Buffer || val instanceof Date || val instanceof RegExp);
  }

  /**
   * clone value from specific value
   * @param {*} val - the input value
   * @return {boolean} whether a special value
   */
  static clone(val) {
    if (val instanceof Buffer) {
      return Buffer.from(val);
    }
    if (val instanceof Date) {
      return new Date(val.getTime());
    }
    if (val instanceof RegExp) {
      return new RegExp(val);
    }
    throw new Error('Unexpected situation');
  }
}

export default BuiltIn.isBuiltIn;
export { BuiltIn };
