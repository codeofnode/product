
/**
 * @module picker
 */

class Picker {
  /**
   * Pick a set of keys from source to create a new one
   * @param {Object} o - the source object
   * @param {...Object} props - n number of properties as arguments
   * @return {Object} the new object created
   */
  static pick(o, ...props) {
    return Object.assign({}, ...props.map(prop => ({ [prop]: o[prop] })));
  }
}

export default Picker.pick;
export { Picker };
