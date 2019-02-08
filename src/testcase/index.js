import requireDir from 'require-dir';
import { resolve } from 'path';
import appImport, { Manager } from '../appImport';

const requireManager = new Manager('');
const executors = requireDir('../executors');
const { Pojo } = appImport('petu/obj/pojo');
const replace = appImport('petu/str/replace').default;
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
  /* eslint-disable no-param-reassign */

  /*
   * to populate the methods out of configuration
   * @param {Object} instance - the instance to which methods to be populated
   * @static
   */
  static populateMethods(instance) {
    if (typeof instance.methods === 'string') {
      instance.methods = requireManager.load(resolve(instance.methods));
    }
    if (Pojo.isDict(instance.methods)) {
      Object.keys(instance.methods).forEach((meth) => {
        const vl = instance.methods[meth];
        if (Array.isArray(vl)) {
          instance.methods[meth] = new Function(...vl); // eslint-disable-line no-new-func
        } else if (typeof vl !== 'function') {
          delete instance.methods[meth];
        }
      });
    } else {
      instance.methods = {};
    }
  }

  /* eslint-disable */

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
    this.vars = Object.assign(JSON.parse(runner.suiteVars), tc.vars);
    this.methods = Object.assign({}, runner.methods, tc.methods);
    this.abortFunction = this.abort.bind(this);
    this.constructor.populateMethods(this);
    this.runner = runner;
    this.runner.on('abort', this.abortFunction);
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
        ? cropString(this.request.url || 'some test')
        : 'No Summary';
  }

  /**
   * start the execution of test cases
   */
  exec() {
    const executor = this.replace(this.type);
    if (Object.prototype.hasOwnProperty.call(executors, this.executor)) {
      this.executor = new (executors[this.executor])(this);
      return this.executor.exec();
    }
    throw new Error('Allrounder: Executor not found.');
  }

  /**
   * abort the execution of test case
   */
  abort() {
    return this.executor.abort();
  }
}

export default TestCase;
