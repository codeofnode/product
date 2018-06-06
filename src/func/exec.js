
/**
 * @module exec
 */

/**
  * The executor class
  * @class
  */
class Executor {
  /*
   * a simplet method to initialize and execute a function
   * @param {Object} context - the input instance or context
   * @param {String} method - the method name to call
   * @param {*} params - the parameters passed to the function
   * @param {Function} outputHandler - the output handler function
   * @param {Boolean} [construct=false] - whether to construct or not
   * @param {Boolean} [isAsync] - whether its async or not
   * @return {Promise} the promise that resolves with the output data or reject with thrown error
   */
  static exec(context, method, params, outputHandler = () => {}, construct = false, isAsync) {
    return (new Executor(context, method, outputHandler, construct, isAsync)).execute(...params);
  }

  /**
   * Create an instance of Executor class
   * @param {Object} context - the input instance or context
   * @param {String} method - the method name to call
   * @param {Function} outputHandler - the output handler function
   * @param {Boolean} [construct=false] - whether to construct or not
   * @param {Boolean} [isAsync] - whether its async or not
   */
  constructor(context, method, outputHandler = () => {}, construct = false, isAsync) {
    /** @member */
    this.context = context;
    /** @member {String} */
    this.method = method;
    /** @member {Boolean} */
    this.construct = construct;
    /** @member {Boolean} */
    this.isAsync = isAsync;
    /** @member {Function} */
    this.outputHandler = outputHandler;
  }

  /**
   * execute a function
   * @param {*} params - the parameters passed to the function
   * @return {Promise} the promise that resolves with the output data or reject with thrown error
   */
  execute(...params) {
    const payload = params;
    return new Promise((resolve, reject) => {
      const resolving = (...args) => {
        this.outputHandler(null, ...args);
        resolve(...args);
      };
      const rejecting = (...args) => {
        this.outputHandler(...args);
        reject(...args);
      };
      let ret;
      let prevCb;
      let returnWithCB = false;
      const method = this.context[this.method];
      if (this.isAsync !== false && this.isAsync !== 1 && typeof payload[payload.length - 1] === 'function') {
        returnWithCB = true;
        prevCb = payload[payload.length - 1];
        payload[payload.length - 1] = function cb(...args) {
          if (args[0]) rejecting(args[0]);
          else resolving(...(args.slice(1)));
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
        this.returnValue = ret;
      } catch (er) {
        return rejecting(er);
      }
      if (returnWithCB) return undefined;
      if ((this.isAsync !== false) && (ret instanceof Promise)) {
        return ret.then(resolving.bind(this)).catch(rejecting.bind(this));
      }
      return resolving(ret);
    });
  }
}

export default Executor.exec;
export { Executor };
