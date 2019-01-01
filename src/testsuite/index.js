import EventEmitter from 'events';
import { readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import TestCase from '../testcase';
import appImport from '../appImport';

const { isDict } = appImport('petu/obj/pojo').Pojo;
const stringify = appImport('petu/str/stringify').default;
const replace = appImport('petu/str/replace').default;

const TSCacheMap = {};

/**
 * @module testsuite
 */

/**
  * The Test suite class
  * @class
  */

class TestSuite extends EventEmitter {
  /**
   * Create an instance of TestSuite class
   * @param {Allrounder} runner - the allrounder runner instance
   * @param {Object} conf - the configuration object
   * @param {Number[]} [conf.steps=[]] the test steps to execute
   * @param {Number} [conf.bail=0] whether to bail on first failure
   * @param {Number} [conf.stacktrace=0] whether to print stacktrace in case of failure
   * @param {Number} [conf.timeout=1000] to set the default timeout
   * @param {Number} [conf.whileInterval=1000] in case of while looping how much interval gap between test cases
   * @param {String} [conf.type=rest] what kind of validation is it
   * @param {String} [conf.debug=] what info to console all the tests
   * @param {String} [conf.debugOnFail=] what info to console for failed test
   * @param {Object} [conf.vars=] the input variable to start with
   * @param {Object} [options={}] - the options object
   */
  constructor(runner, conf, options = {}) {
    super();
    Object.assign(this, conf);
    TestCase.populateMethods(this)
    this.runner = runner;
    this.dir = dirname(this.filePath);
    this.suiteVars = stringify(this.vars);
    runner.once('loading-testsuites', this.load.bind(this));
    runner.once('loaded', this.afterAllLoaded.bind(this));
    runner.on('starting', this.start.bind(this));
    runner.on('stopping', this.stop.bind(this));
    runner.once('end', this.end.bind(this));
  }

  /**
   * return the file string of a file, use the cached file if already loaded
   * @param {String} [dir] - the directory name where file exists
   * @param {String} [fileName] - the file name of the testsuite
   * @param {Object} [filePath] - the file path, if passed fileName is ignored
   * @return {String} the file content string
   */
  getTSData(dir, fileName, filePath) {
    const key = filePath ? resolve(filePath) : resolve(join(dir, fileName));
    if (!Object.prototype.hasOwnProperty.call(TSCacheMap, key)) {
      const str = readFileSync(resolve(key)).toString();
      let json = JSON.parse(str);
      if (Array.isArray(json)) {
        json = { tests: json };
      } else if (!isDict(json)) {
        TSCacheMap[key] = { tests: [] };
        return TSCacheMap[key]
      }
      if (!Array.isArray(json.tests) && !Array.isArray(json.test)) {
        json = { tests: [json] };
      }
      if (!Array.isArray(json.tests)) {
        json.tests = [json.test || json.tests];
      }
      TSCacheMap[key] = json;
    }
    return TSCacheMap[key];
  }

  /**
   * free up load memory
   */
  afterAllLoaded() {
    delete TSCacheMap[resolve(this.filePath)];
  }

  /**
   * load the test cases
   */
  load() {
    const json = this.getTSData(this.dir, null, this.filePath);
    if (Array.isArray(json.tests)) {
      this.tests = json.tests;
    }
    const tl = this.tests.length;
    const tests = this.tests;
    for (let z = 0; z < tl; z++) {
      const steps = tests[z].steps;
      const vars = tests[z].vars || {}
      if (typeof tests[z].import === 'string' && !replace(tests[z].disabled, Object.assign({}, vars, this.vars, vars))) {
        if (!tests[z].import.endsWith('.json')) {
          tests[z].import += '.json';
        }
        const tsjson = this.getTSData(this.dir, null, join(this.dir, tests[z].import));
        if (tests[z].onlyVars !== false) {
          if (typeof tsjson.vars === 'object' && tsjson.vars !== null) {
            Object.assign(this.vars, tsjson.vars);
          }
          if (typeof tsjson.methods === 'object' && tsjson.methods !== null) {
            Object.assign(this.methods, tsjson.methods);
          }
        }
        if (tests[z].onlyVars === true) {
          tests[z].disabled = true;
          continue;
        }
        const art = [];
        if (steps !== undefined) {
          function addStep(z) {
            if (typeof tsjson.tests[z] === 'object' && typeof tsjson.tests[z] !== null) {
                let toPush = JSON.parse(JSON.stringify(tsjson.tests[z]));
                if (toPush) art.push(toPush);
            }
          }
          if (Array.isArray(steps)) {
            steps.forEach(addStep)
          } else if (typeof steps === 'object' && steps !== null
              && (typeof steps.from === 'number' || typeof steps.to === 'number')) {
            for (let st = steps.from; st <= steps.to; st++) {
              addStep(st)
            }
          } else if (typeof steps === 'number') {
            addStep(steps)
          }
        } else {
          art = tsjson.tests
        }
        tests.splice.bind(tests, z, 1).apply(tests, art);
        ln += art.length - 1;
        z--;
      }
    }
    tests.forEach(tc => (new TestCase(this, tc)));
    return this;
  }

  /**
   * start the execution of test cases
   */
  start() {
    return this;
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
