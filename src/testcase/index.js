import { readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import defaultConf from '../default.json';
import appImport from '../appImport';
import requireDir from 'require-dir';

const executors = requireDir('../executors')

const Pojo = appImport('petu/obj/pojo').Pojo;
const replace = appImport('petu/str/replace').replace;
const pick = appImport('petu/obj/pick').default;

/**
 * @module testcase
 */

/**
  * The Test case class
  * @class
  */

class TestCase {
  /*
   * to populate the methods out of configuration
   * @param {Object} instance - the instance to which methods to be populated
   * @static
   */
  static populateMethods(instance) {
    if (typeof instance.methods === 'string') {
      instance.methods = require(resolve(meth));
    }
    if (Pojo.isDict(instance.methods)) {
      Object.keys(instance.methods).forEach((meth) => {
        const vl = instance.methods[meth]
        if (Array.isArray(vl)) {
          instance.methods[meth] = new Function(...vl);
        } else if (typeof vl !== 'function') {
          delete instance.methods[meth];
        }
      });
    } else {
      instance.methods = {};
    }
  }

  /**
   * Create an instance of TestCase class
   * @param {TestSuite} runner - the testsuite runner instance
   * @param {Object} tc - the tc configuration object
   * @param {Object} tc.testcase the test case to execute
   * @param {Number} [tc.stacktrace=0] whether to print stacktrace in case of failure
   * @param {Number} [tc.timeout=1000] to set the default timeout
   * @param {Number} [tc.whileInterval=1000] in case of while looping how much interval gap between test cases
   * @param {String} [tc.type=rest] what kind of validation is it
   * @param {String} [tc.debug=] what info to console all the tests
   * @param {String} [tc.debugOnFail=] what info to console for failed test
   * @param {Object} [tc.vars=] the input variable to start with
   * @param {Object} [options={}] - the options object
   */
  constructor(runner, tc, options = {}) {
    Object.assign(this, pick(runner, ...(Object.keys(runner).filter(ky => Pojo.baseTypes.indexOf(typeof runner[ky]) !== -1))));
    Object.assign(this, tc);
    this.vars = Object.assign({}, runner.vars, tc.vars)
    this.methods = Object.assign({}, runner.methods, tc.methods)
    this.constructor.populateMethods(this)
    this.result = {};
    this.listenTo(runner);
  }

  /**
   * a function call to listen to runner events
   * @param {TestSuite} runner - the testsuite runner instance
   */
  listenTo(runner) {
    runner.on('starting', this.start.bind(this));
    runner.on('stopping', this.stop.bind(this));
    runner.once('end', this.end.bind(this));
    return this;
  }

  /**
   * the input to replace
   */
  replace(input) {
    return replace(input, this.vars, this.methods);
  }

  /**
   * start the execution of test cases
   */
  start() {
    this.executor = this.replace(this.type);
    if (Object.prototype.hasOwnProperty.call(executors, this.executor)) {
      new (executors[this.executor])(exec);
    } else {
      return this.end();
    }
  }

  /**
   * stop the execution of test cases
   */
  stop() {
    return this;
  }

  /**
   * end the execution of test cases
   */
  end() {
    return this;
  }
}

export default TestCase;
