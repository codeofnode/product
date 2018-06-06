
/**
 * @module exec
 */

/**
  * The executor class
  * @class
  */
class Executor {
  /**
   * Create an instance of Executor class
   * @param {Object} context - the input instance or context
   * @param {String} method - the method name to call
   * @param {Boolean} [construct=false] - whether to construct or not
   * @param {Boolean} [isAsync=false] - whether its async or not
   */
  constructor(context, method, construct = false, isAsync = false) {
    /** @member */
    this.context = context;
    /** @member {String} */
    this.method = method;
    /** @member {Boolean} */
    this.construct = construct;
    /** @member {Boolean} */
    this.isAsync = isAsync;
  }

  /**
   * execute a function
   * @param {*} params - the parameters passed to the function
   * @return {Promise} the promise that resolves with the output data or reject with thrown error
   */
  execute(...params) {
    const payload = params;
    return new Promise((resolve, reject) => {
      let ret;
      let prevCb;
      let returnWithCB = false;
      const method = this.context[this.method];
      if (this.isAsync !== false && this.isAsync !== 1 && typeof payload[payload.length - 1] === 'function') {
        returnWithCB = true;
        prevCb = payload[payload.length - 1];
        payload[payload.length - 1] = function cb(...args) {
          if (args[0]) reject(args[0]);
          else resolve(null, ...(args.slice(1)));
          return prevCb(...args);
        };
      }
      try {
        if (this.construct) {
          if (payload.length) {
            payload.unshift(null);
            ret = new (Function.prototype.bind.apply(method, payload))();
          } else {
            ret = new (Function.prototype.bind.apply(method))();
          }
        } else {
          ret = method.apply(this.context, payload);
        }
      } catch (er) {
        return reject(er);
      }
      if (returnWithCB) return undefined;
      if ((this.isAsync !== false) && (ret instanceof Promise)) {
        return ret.then(resolve).catch(reject);
      }
      return resolve(ret);
    });
  }
}

export default Executor.exec;
export { Executor };
