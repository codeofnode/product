
/**
 * @module hasIt
 */

/**
  * Has it class
  * @class
  */
class HasIt {
  /**
   * whether a value contains a string as property or not
   * @param {*} inp - the source value
   * @param {String} prop - the property to find out
   * @return {Boolean} if inp has prop
   */
  static has(inp, prop) {
    return (inp !== undefined && inp !== null && Object.prototype.hasOwnProperty.call(inp, prop));
  }
}

export default HasIt.has;
export { HasIt };
