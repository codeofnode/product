import { sep, isAbsolute, join } from 'path';
import jsonqueryPath from 'jsonpath';
import { Manager } from '../appImport';

const CWD = process.cwd();
const requireManager = new Manager('');

/**
 * @module unit-test
 */

/**
  * The Unit Test Case executor class
  * @class
  */

class Executor {
  /**
   * query from jsonpath
   * @static
   *
   * @param {Object} obj - the object on which jsonquery to be executed
   * @param {String} queryPath - the json query path
   */
  static jsonquery(obj, queryPath) {
    let res = obj;
    if (typeof obj === 'object' && obj !== null) {
      if (queryPath.indexOf('LEN()<') === 0) {
        return jsonqueryPath.query(obj, queryPath.substring(6)).length;
      } else if (typeof queryPath === 'string' && queryPath.indexOf('TYPEOF<') === 0) {
        return (typeof jsonqueryPath.query(obj, queryPath.substring(7))[0]);
      } else if (queryPath.indexOf('ARRAY<') === 0) {
        return jsonqueryPath.query(obj, queryPath.substring(6));
      } else if (queryPath.indexOf('<') === 5) {
        const count = parseInt(queryPath.substr(0, 5), 10);
        if (!Number.isNaN(count)) {
          return jsonqueryPath.query(obj, queryPath.substring(6), count);
        }
      }
      res = jsonqueryPath.query(obj, queryPath, 1);
      res = (Array.isArray(res) && res.length < 2) ? res[0] : res;
    }
    return res;
  }
  /**
   * Create an instance of Executor class
   * @param {Object} testcase - the testcase instance
   * @param {Object} testcase.request - the request / executor object
   * @param {String} testcase.request.method the method which is needed to be execute
   * @param {Object[]} [testcase.request.params] the parameters required to pass to the function
   * @param {Boolean} [testcase.request.construct] whether to execute as constructor
   */
  constructor(testcase) {
    this.replace = testcase.replace.bind(testcase);
    this.context = this.extractContext(testcase);
    this.method = this.extractMethod(testcase);
    this.payload = this.extractPayload(testcase);
    this.isAsync = testcase.async === undefined ? testcase.runner.async : testcase.async;
    this.construct = !!testcase.construct;
  }

  /**
   * extracting the context for testcase
   */
  extractContext(testcase) {
    let main;
    if (testcase.context) {
      if (typeof testcase.context === 'object' && testcase.context !== null
          && testcase.context.source && testcase.context.path) {
        main = Executor.jsonquery(
          this.replace(testcase.context.source),
          this.replace(testcase.context.path),
        );
      } else {
        main = this.replace(testcase.context);
      }
    } else {
      main = this.replace(testcase.require || testcase.runner.require);
      if (main === '$global') {
        main = global;
      } else if (typeof main === 'string' && isAbsolute(main)) {
        main = requireManager.load(main);
      } else if (!main) {
        if (testcase.runner.srcdir) {
          main = requireManager.load(join(
            CWD,
            testcase.runner.srcdir, ...testcase.runner.filePath.split(sep).slice(1),
          ));
        }
        if (!main) {
          main = global;
        }
      }
    }
    return main;
  }

  /**
   * extracting the test case payload
   */
  extractPayload(testcase) {
    const params = testcase.params || testcase.payload;
    let payload = params ? [] : this.replace(params);
    if (!Array.isArray(payload)) payload = [payload];
    return payload;
  }

  /**
   * extracting the test case method
   */
  extractMethod(testcase) {
    return Executor.jsonquery(
      this.context,
      this.replace((testcase.execute || testcase.request).method),
    );
  }

  /**
   * executing the test case
   */
  exec() {
    const {
      isAsync, payload, method, context, construct,
    } = this;
    return new Promise(((res, rej) => {
      let ret;
      let prevCb;
      let returnWithCB = false;
      if (isAsync !== false && isAsync !== 1 && typeof payload[payload.length - 1] === 'function') {
        returnWithCB = true;
        prevCb = payload[payload.length - 1];
        payload[payload.length - 1] = function cb(err, ...args) {
          const result = prevCb(...args);
          if (err) rej(err);
          else res(args);
          return result;
        };
      }
      try {
        if (construct) {
          if (payload.length) {
            payload.unshift(null);
            ret = new (Function.prototype.bind.apply(method, payload))();
          } else {
            ret = new (Function.prototype.bind.apply(method))();
          }
        } else {
          ret = method.apply(context, payload);
        }
      } catch (er) {
        return rej(er);
      }
      if (!returnWithCB && isAsync !== false && (ret instanceof Promise)) {
        return ret.then((resolved) => {
          res(resolved);
        }).catch((rejected) => {
          rej(rejected);
        });
      }
      return res(ret);
    }));
  }
}

export default Executor;
