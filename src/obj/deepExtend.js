
import { clone as cloneBuiltIn, isBuiltIn } from '../builtin/builtin';

/**
 * @module deepExtender
 */

/**
  * Deep extender class
  * @class
  */
class DeepExtender {
  /**
   * the delete key - if found, that value must be removed from root. whether its array or object
   * @static
   *
   * @example
   * // returns [0,2];
   * deepExtend([0,1,2],[0,'$del',2]);
   */
  static DelKey = '$del';

  /**
   * the rep key - the next record will be as it is as given.
   * @static
   *
   * @example
   * // returns [[],1,2];
   * deepExtend([{},1,2],['$rep',[]]);
   */
  static RepKey = '$rep';

  /**
   * Create an instance of DeepExtender class
   * @param {String} [delKey] - the delete key, if to remove from root
   * @param {String} [repKey] - replace the next item, used in array
   */
  constructor(delKey = DeepExtender.DelKey, repKey = DeepExtender.RepKey) {
    this.delKey = delKey;
    this.repKey = repKey;
  }

  /**
   * Recursive cloning array.
   * @param {Object[]} arr - the target array
   * @param {Object[]} def - the default, source array
   * @return {Object[]} the cloned array
   */
  deepCloneArray(arr, def) {
    let ln = arr.length;
    const clone = new Array(ln);
    const defln = Array.isArray(def) ? def.length : 0;
    if (ln < defln) {
      ln = defln;
    }

    for (let on = 0, minus = 0, item, z = 0, defi; z < ln; z += 1, on += 1) {
      item = arr[z];
      defi = z - minus;
      if (clone[on - 1] === this.repKey) {
        clone[on] = item;
        on -= 1;
        clone.splice(on, 1);
      } else if (item === null || item === undefined) {
        if (defi < defln && Array.isArray(def)) {
          clone[on] = (typeof def[defi] !== 'object' || def[defi] === null)
            ? def[defi]
            : this.deepExtend({}, def[defi]);
        }
      } else if (item === this.delKey) {
        clone.splice(on, 1);
        on -= 1;
      } else if (item === this.repKey) {
        clone[on] = arr[z];
        ln += 1;
        minus += 1;
      } else if (typeof item === 'object') {
        if (Array.isArray(item)) {
          clone[on] = this.deepCloneArray(item, def[defi] && def[defi]);
        } else if (isBuiltIn(item)) {
          clone[on] = cloneBuiltIn(item);
        } else {
          clone[on] = this.deepExtend(Array.isArray(def) && typeof def[defi] === 'object' ? def[defi] : {}, item);
        }
      } else {
        clone[on] = item;
      }
    }
    return clone;
  }

  /**
   * Extening object that entered in first argument.
   *
   * Returns extended object or false if have no target object or incorrect type.
   *
   * If you wish to clone source object (without modify it), just use empty new
   * object as first argument, like this:
   *   deepExtend({}, yourObj_1, [yourObj_N]);
   *
   * @param {...Object} args - n number of arguments
   * @return {Object} the extended and new target
   */
  deepExtend(...args) {
    if (args.length < 1 || typeof args[0] !== 'object') {
      return false;
    }
    if (args.length < 2) {
      return args[0];
    }

    let target = args[0];
    let val;
    let src;

    args.forEach((obj, ind) => {
      // skip argument if isn't an object, is null, or is an array
      if (!ind || typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(target) && Array.isArray(obj)) {
        target = this.deepCloneArray(obj, target);
        return;
      }

      Object.keys(obj).forEach((key) => {
        src = target[key]; // source value
        val = obj[key]; // new value

        if (val === target || val === null) {
          // recursion prevention
          // ignore

        } else if (val === this.delKey) {
          delete target[key];

        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
        } else if ((typeof val !== 'object') || (val[this.repKey] === this.repKey)) {
          if (typeof val === 'object') {
            delete val[this.repKey];
          }
          target[key] = val;

        // just clone arrays (and recursive clone objects inside)
        } else if (Array.isArray(val)) {
          if (val[0] === this.repKey) {
            target[key] = val.slice(1);
          } else {
            target[key] = this.deepCloneArray(val, target[key]);
          }

        // custom cloning and overwrite for specific objects
        } else if (isBuiltIn(val)) {
          target[key] = cloneBuiltIn(val);

        // overwrite by new value if source isn't object or array
        } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
          target[key] = this.deepExtend({}, val);

        // source value and new value is objects both, extending...
        } else {
          target[key] = this.deepExtend(src, val);
        }
      });
    });
    return target;
  }
}

const extender = new DeepExtender();
export default extender.deepExtend.bind(extender);
export { DeepExtender };
