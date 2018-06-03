/**
 * @module padder
 */

class Padder {
  /**
   * Pads a string
   * @param {String} str - the input string
   * @param {Number} num - length of complete output
   * @param {Boolean} [isRight=true] - if direction of padding requires on right of input string
   * @param {String} [ch=' '] - the padding character
   * @return {String} the new padded string
   */
  static padding(str, num, isRight = true, ch = ' ') {
    const blank = ch.repeat(num - str.length);
    return (isRight ? str : blank) + (isRight ? blank : str);
  }
}

export default Padder.padding;
export { Padder };
