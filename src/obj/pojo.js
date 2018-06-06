import { Walker } from './walk';

/**
 * @module pojo
 */

const ProtoObj = Object.prototype;
const getProtOf = Object.getPrototypeOf;

/**
  * The pojo class
  * @class
  */
class Pojo {
  /*
   * The basic types that can be considered as primitive
   * @member {String[]}
   * @static
   */
  static baseTypes = ['string', 'number', 'boolean'];

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
    if (!allowPrim && Pojo.baseTypes.includes(typeof inp)) {
      return false;
    }
    if (typeof inp !== 'object') {
      return false;
    }
    if (!allowArray && Array.isArray(inp)) {
      return false;
    }
    if (!allowNull && inp === null) {
      return false;
    }
    return getProtOf(inp) === ProtoObj;
  }

  /**
   * clone a object upto nth level, for primitives properties
   * @param {Object} inp - the input object
   * @param {Number} [level=2] - upto how much depth, cloning required
   * @return {Object} the new object created
   */
  static clonePrimitive(inp, level = 2) {
    const nLevelWalker = new Walker(level);
    const walk = nLevelWalker.walk.bind(nLevelWalker);
    const currentPtr = [];
    if (Pojo.baseTypes.includes(typeof inp)) {
      return inp;
    }
    walk((obj, key, rt, depth) => {
      if (depth < level) {
        if (Pojo.isPojo(obj, { allowNull: false, allowPrim: false })) {
          const nextVal = Array.isArray(obj) ? new Array(obj.length) : {};
          if (currentPtr.length === 0) {
            currentPtr.push(obj);
          } else {
            currentPtr[key] = nextVal;
            if (currentPtr.length <= depth) {
              currentPtr.push(nextVal);
            } else {
              currentPtr[depth] = nextVal;
            }
          }
        } else if (Pojo.baseTypes.includes(typeof obj)) {
          currentPtr[depth][key] = obj;
        } else if (obj === null) {
          currentPtr[depth][key] = obj;
        }
      }
    }, null, inp);
    return Object.assign(...currentPtr);
  }

  /**
   * find if the argument is dictionary or not
   * @param {*} inp - the input argumnet
   * @return {Boolean} whether its dict
   */
  static isDict(inp) {
    return Pojo.isPojo(inp, {
      allowPrim: false,
      allowNull: false,
      allowArray: false,
    });
  }
}

export default Pojo.isPojo;
export { Pojo };
