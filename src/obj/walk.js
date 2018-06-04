
import { isDict } from './pojo';

/**
 * @module walker
 */

/**
  * The walker class
  * @class
  */
class Walker {
  static MaxObjDepth = 99;
  static EndVar = '$W_END';

  /**
   * decides if its end of obj walk, can be customized as per needs
   * @param {Object} obj - object to be passed
   * @param {Number} depth - depth of obj from main first object passed
   * @return {Boolean} whether end is reached
   */
  static ifEndForObjWalk(obj, depth) {
    return ((depth < Walker.MaxObjDepth && typeof obj === 'object'
      && obj !== null && obj[Walker.EndVar] !== true
      && isDict(obj)) ? obj : false);
  }

  /**
   * Iterate all values at all dept of an object
   * @param {Function} fun - the function to be called for each of the value
   * @param {Object} obj - object to be passed
   * @param {Object} rt - parent object of object to be passed
   * @param {String} key - the key at which obj is found of parent
   * @param {Number} depth - depth of obj from main first object passed
   * @param {Boolean} isLast - whether the key is last key of object
   * @return {Object} the modified or original object
   */
  static walk(fun, rt, obj, key, depth = 0, isLast) {
    fun(obj, key, rt, depth, typeof isLast === 'boolean' ? isLast : true);
    const ob = Walker.ifEndForObjWalk(obj, depth);
    if (ob) {
      const kys = Object.keys(ob);
      const lastln = kys.length - 1;
      const deep = depth + 1;
      for (let z = 0; z <= lastln; z += 1) {
        Walker.objwalk(fun, ob, ob[kys[z]], kys[z], deep, (z === lastln));
      }
    }
  }
}

export default Walker.walk;
export { Walker };
