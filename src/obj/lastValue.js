/**
 * @module lastMan
 */

/**
  * The Last man class
  * @class
  */
class LastMan {
  /**
   * Fill up the empty blocks up to request path
   * @param {Object} inp - input main object
   * @param {String} key - the key of which value to inpt should be found
   * @return {Object} the modified filled object
   */
  static fillToLast(...args) {
    const len = args.length;
    let now = args[0];
    for (let z = 1; z < len; z++) {
      if (!LastMan.getProp(now[args[z]])) {
        now[args[z]] = {};
      }
      now = now[args[z]];
    }
    return now;
  }

  /**
   * get property of input for a key
   * @param {Object} inp - input object
   * @param {String} key - the key of which value to inpt should be found
   * @return {*} the value or undefined
   */
  static getProp(inp, key) {
    return (inp !== undefined && inp !== null) ? inp[key] : undefined;
  }

  /**
   * It gets the last value of a deep nested object.
   * Returns undefined in case if one of the property is missing in request path
   * Very usefull aginst we need to write && multiples time,
   *   just to prevent the `Cannot read property x of undefined`
   *
   * @param {...Object|String} argmnts - n number of arguments, first one should be object
   * @return {*} the deeper value at the request path
   */
  static lastValue(...argmnts) {
    let len;
    let now;
    let moveWith;
    let args = argmnts;
    let root = args[0];
    if (args.length === 2 && args[1] === true && Array.isArray(root)) {
      args = root;
      [root] = args;
    }
    len = args.length;
    now = root;
    moveWith = LastMan.getProp;
    if (len < 1) return undefined;
    if (len === 1) return root;
    const func = args[len - 1];
    if (typeof func === 'function') {
      len -= 1;
      moveWith = func;
    }
    for (let z = 1; z < len; z++) {
      now = moveWith(root, args[z]);
      if (now === undefined) {
        break;
      } else {
        root = now;
      }
    }
    return now;
  }
}

export default LastMan.lastValue;
export { LastMan };
