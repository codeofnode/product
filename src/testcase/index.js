import { readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import defaultConf from '../default.json';
import appImport from '../appImport';
import requireDir from 'require-dir';

const executors = requireDir('../executors')
console.log(executors)

const { isDict } = appImport('petu/obj/pojo').Pojo;
const replace = appImport('petu/str/replace');

/**
 * @module testcase
 */

/**
  * The Test case class
  * @class
  */

class TestCase {
  /**
   * Create an instance of TestCase class
   * @param {Object} conf - the configuration object
   * @param {Object} conf.testcase the test case to execute
   * @param {Number} [conf.stacktrace=0] whether to print stacktrace in case of failure
   * @param {Number} [conf.timeout=1000] to set the default timeout
   * @param {Number} [conf.whileInterval=1000] in case of while looping how much interval gap between test cases
   * @param {String} [conf.type=rest] what kind of validation is it
   * @param {String} [conf.debug=] what info to console all the tests
   * @param {String} [conf.debugOnFail=] what info to console for failed test
   * @param {Object} [conf.vars=] the input variable to start with
   * @param {Object} [options={}] - the options object
   * @param {Object} [options.runner] - if runner is passed it will listen to runner events else not
   */
  constructor(conf, options = {}) {
    Object.assign(this, defaultConf, conf);
    if (typeof this.methods === 'string') {
      this.methods = require(resolve(meth));
    }
    if (isDict(this.methods)) {
      Object.keys(this.methods).forEach((meth) => {
        if (Array.isArray(meth)) {
          this.methods[meth] = new Function(...meth);
        } else if (typeof meth !== 'function') {
          delete this.methods[meth];
        }
      });
    } else {
      this.methods = {};
    }
    this.result = {};
    if (options.runner) {
      this.listenToRunner(runner);
    }
  }

  /**
   * a function call to listen to runner events
   * @param {TestSuite} runner - the testsuite runner instance
   */
  listenTo(runner) {
    this.runner = runner;
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

export default TestSuite;
