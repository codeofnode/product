/**
 * @module assigner
 */

class Assigner {
  static baseTypes = ['string', 'number', 'boolean', 'undefined'];

  /**
   * Update one object given the another patch object.
   * Does support selective of primitive types data as well
   *
   * @param {Object} inp - input object
   * @param {Object} up - the update object
   * @param {Boolean} noob - if to only copy primitive types data
   * @return {Object} the new updated object
   */
  static copyProperties(inp, up, noob = false) {
    let inpt = inp;
    if (typeof inpt !== 'object' || !inpt) inpt = Array.isArray(up) ? new Array(up.length) : {};
    if (typeof up === 'object' && up) {
      const kys = Object.keys(up);
      const kl = kys.length;
      for (let j = 0; j < kl; j++) {
        if (noob !== true || (Assigner.baseTypes.indexOf(typeof inpt[kys[j]]) !== -1)
            || (Assigner.baseTypes.indexOf(typeof up[kys[j]]) !== -1)) {
          inpt[kys[j]] = up[kys[j]];
        }
      }
    }
    return inpt;
  }

  /**
   * Assign the a number of objects into source object.
   * @param {...Object} args - n number of objects
   * @return {Object} the new assigned updated object
   */
  static assign(...args) {
    let ln = args.length;
    let noob = args[ln - 1];
    if (noob === true) ln -= 1;
    else noob = false;
    const no = Assigner.copyProperties(args[0], args[1], noob);
    for (let j = 2; j < ln; j++) {
      Assigner.copyProperties(no, args[j], noob);
    }
    return no;
  }
}

export default Assigner.assign;
export { Assigner };
