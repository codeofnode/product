
/**
 * @module pojo
 */

const ProtoObj = Object.prototype;
const getProtOf = Object.getPrototypeOf;

class Pojo {
  /**
   * find if the argument is pojo or not
   * @param {*} inp - the input argumnet
   * @param {Object} [opts] - options to customize function
   * @param {Boolean} [opts.allowArray=true] - whether to allow array as pojo
   * @param {Boolean} [opts.allowPrim=true] - whether to allow primitive value as pojo
   * @param {Boolean} [opts.allowNull=true] - whether to allow null as pojo
   * @return {Boolean} whether its Pojo
   */
  static isPojo(inp, { allowArray = true, allowPrim = true, allowNull = true }) {
    if (!allowArray && Array.isArray(inp)) {
      return false;
    }
    if (!allowNull && inp === null) {
      return false;
    }
    if (!allowPrim && ['string', 'number', 'boolean'].includes(typeof inp)) {
      return false;
    }
    return getProtOf(inp) === ProtoObj;
  }

  /**
   * find if the argument is dictionary or not
   * @param {*} inp - the input argumnet
   * @return {Boolean} whether its dict
   */
  static isDict(inp) {
    return typeof inp === 'object' && inp !== null && !Array.isArray(inp) && getProtOf(inp) === ProtoObj;
  }
}

export default Pojo.isPojo;
export { Pojo };
