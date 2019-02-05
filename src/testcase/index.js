import { readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import defaultConf from '../default.json';
import appImport from '../appImport';
import requireDir from 'require-dir';

const executors = requireDir('../executors')

const Pojo = appImport('petu/obj/pojo').Pojo;
const replace = appImport('petu/str/replace').replace;
const cropString = appImport('petu/str/cropString').default;
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
   * @param {Number} [tc.whileInterval=1000] in case of while looping how much interval gap between test cases
   * @param {String} [tc.type=rest] what kind of validation is it
   * @param {String} [tc.debug=] what info to console all the tests
   * @param {String} [tc.debugOnFail=] what info to console for failed test
   * @param {Object} [tc.vars=] variables that will be used for replace
   * @param {Object} [tc.methods=] functions that will be used for replace
   * @param {Object} [options={}] - the options object
   */
  constructor(runner, tc, options = {}) {
    Object.assign(this, pick(runner, ...(Object.keys(runner).filter(ky => Pojo.baseTypes.indexOf(typeof runner[ky]) !== -1))));
    Object.assign(this, tc);
    this.vars = Object.assign(JSON.parse(runner.suiteVars), tc.vars)
    this.methods = Object.assign({}, runner.methods, tc.methods)
    this.constructor.populateMethods(this)
    this.runner = runner;
  }

  /**
   * the input to replace
   */
  replace(input) {
    return replace(input, this.vars, this.methods);
  }

  /**
   * get the summary of test case
   */
  summary() {
    const summ = this.summary || this.testcase || this.it || this.name;
    return summ
      ? this.replace(summ)
      : this.request
        ? cropString(this.request.url || this.request.payload || 'some unknown test')
        : 'No Summary';
  }

  /**
   * start the execution of test cases
   */
  exec(done) {
    this.executor = this.replace(this.type);
    if (Object.prototype.hasOwnProperty.call(executors, this.executor)) {
      new (executors[this.executor])(this, done);
    } else {
      throw new Error('Allrounder: Executor not found.')
    }
  }
}

export default TestCase;
