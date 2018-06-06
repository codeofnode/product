
import { Pojo } from './pojo';

/**
 * @module walker
 */

/**
  * The walker class
  * @class
  */
class Walker {
  /* the max depth upto which walking will be done
   * @static
   */
  static MaxObjDepth = 99;

  /* the end symbol, to stop walking more in depth
   * @static
   */
  static EndVar = '$W_END';

  /**
   * Create an instance of walker instance
   * @param {Number} [depth=99] - depth upto which we need to walk, in order to avoid recursion
   * @param {String} [endVar=$W_END] - the end symbol to stop the walk
   */
  constructor(depth = Walker.MaxObjDepth, endVar = Walker.EndVar) {
    this.endVar = endVar;
    this.depth = depth;
  }

  /**
   * decides if its end of obj walk, can be customized as per needs
   * @param {Object} obj - object to be passed
   * @param {Number} depth - depth of obj from main first object passed
   * @return {Boolean} whether end is reached
   */
  ifEndForObjWalk(obj, depth) {
    return (
      depth < this.depth &&
      Pojo.isPojo(obj, { allowNull: false, allowPrim: false }) &&
      obj[this.endVar] !== true
    ) ? obj : false;
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
  walk(fun, rt, obj, key, depth = 0, isLast) {
    fun(obj, key, rt, depth, typeof isLast === 'boolean' ? isLast : true);
    const ob = this.ifEndForObjWalk(obj, depth);
    if (ob) {
      const kys = Object.keys(ob);
      const lastln = kys.length - 1;
      const deep = depth + 1;
      for (let z = 0; z <= lastln; z++) {
        this.walk(fun, ob, ob[kys[z]], kys[z], deep, (z === lastln));
      }
    }
  }
}

const walker = new Walker();
export default walker.walk.bind(walker);
export { Walker };
