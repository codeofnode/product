/**
 * @module stringifier
 */

/**
  * The Stringifier class
  * @class
  */
class Stringifier {
  /**
   * Stringify anything
   * @param {*} inp - the input value
   * @param {Boolean} [pretty=false] - whether to prettyfi in case of json
   * @return {String} the new stringified string
   */
  static stringify(inp, pretty = false) {
    let st = inp;
    if (typeof st !== 'string') {
      if (typeof st === 'object') {
        try {
          st = pretty ? JSON.stringify(st, null, 2) : JSON.stringify(st);
        } catch (er) {
          st = String(st);
        }
      } else {
        st = String(st);
      }
    }
    return st;
  }
}

export default Stringifier.stringify;
export { Stringifier };
