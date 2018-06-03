
/**
 * @module pojo
 */

const ProtoObj = Object.prototype;
const getProtOf = Object.getPrototypeOf;

class Pojo {
  /**
   * find if the argument is pojo or not
   * @param {*} inp - the input argumnet
   * @return {Boolean} whether its Pojo
   */
  static isPojo(inp) {
    if (inp === null || typeof inp !== 'object') {
      return false;
    }
    return getProtOf(inp) === ProtoObj;
  }
}

export default Pojo.isPojo;
export { Pojo };
