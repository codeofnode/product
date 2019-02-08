import EventEmitter from 'events';
import { readFileSync } from 'fs';
import { resolve, join, dirname, basename } from 'path';
import TestCase from '../testcase';
import appImport from '../appImport';

const { isDict } = appImport('petu/obj/pojo').Pojo;
const stringify = appImport('petu/str/stringify').default;
const replace = appImport('petu/str/replace').default;
const pick = appImport('petu/obj/pick').default;

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
   * @param {Number} [conf.whileInterval=1000] in case of while looping, interval between testcases
   * @param {String} [conf.type=rest] what kind of validation is it
   * @param {String} [conf.debug=] what info to console all the tests
   * @param {String} [conf.debugOnFail=] what info to console for failed test
   * @param {Object} [conf.vars=] the input variable to start with
   */
  constructor(runner, conf) {
    super();
    Object.assign(this, conf);
    TestCase.populateMethods(this);
    this.runner = runner;
    this.dir = dirname(this.filePath);
    this.stopped = false;
    this.nextTc = -1;
    this.suiteVars = stringify(this.vars);
    this.abortFunction = this.abort.bind(this);
    this.stopFunction = this.stop.bind(this);
    this.startFunction = this.start.bind(this);
    this.runner.on('abort', this.abortFunction);
    this.runner.on('stop', this.stopFunction);
    this.runner.on('start', this.startFunction);
  }

  /**
   * return the file string of a file, use the cached file if already loaded
   * @param {String} [dir] - the directory name where file exists
   * @param {String} [fileName] - the file name of the testsuite
   * @param {Object} [filePath] - the file path, if passed fileName is ignored
   * @return {String} the file content string
   */
  static getTSData(dir, fileName, filePath) {
    const key = filePath ? resolve(filePath) : resolve(join(dir, fileName));
    let json = {};
    if (Object.prototype.hasOwnProperty.call(TSCacheMap, key)) {
      json = TSCacheMap[key];
    } else {
      const str = readFileSync(resolve(key)).toString();
      json = JSON.parse(str);
      if (Array.isArray(json)) {
        json = { tests: json };
      } else if (!isDict(json)) {
        json = { tests: [] };
      } else {
        if (!Array.isArray(json.tests) && !Array.isArray(json.test)) {
          json = { tests: [json] };
        }
        if (!Array.isArray(json.tests)) {
          json.tests = [json.test || json.tests];
        }
      }
      json.fileName = basename(key).split('.').shift();
      TSCacheMap[key] = json;
    }
    return json;
  }

  /**
   * load the test cases
   */
  load() {
    const json = TestSuite.getTSData(this.dir, null, this.filePath);
    if (Array.isArray(json.tests)) this.tests = json.tests;
    Object.assign(this, pick(json, ...(Object.keys(json).filter(ky => ky !== 'tests'))));
    if (json.type) this.type = json.type;
    const { tests } = this;
    let tl = this.tests.length;
    for (let z = 0; z < tl; z++) {
      const { steps, vars = {} } = tests[z];
      if (typeof tests[z].import === 'string' && !replace(tests[z].disabled, Object.assign({}, vars, this.vars, vars))) {
        if (!tests[z].import.endsWith('.json')) {
          tests[z].import += '.json';
        }
        const tsjson = TestSuite.getTSData(this.dir, null, join(this.dir, tests[z].import));
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
        } else {
          let art = [];
          if (steps !== undefined) {
            const addStep = function addStep(j) {
              if (typeof tsjson.tests[j] === 'object' && tsjson.tests[j] !== null) {
                const toPush = JSON.parse(JSON.stringify(tsjson.tests[j]));
                if (toPush) art.push(toPush);
              }
            };
            if (Array.isArray(steps)) {
              steps.forEach(addStep);
            } else if (typeof steps === 'object' && steps !== null
                && (typeof steps.from === 'number' || typeof steps.to === 'number')) {
              for (let st = steps.from; st <= steps.to; st++) {
                addStep(st);
              }
            } else if (typeof steps === 'number') {
              addStep(steps);
            }
          } else {
            art = tsjson.tests;
          }
          tests.splice.bind(tests, z, 1).apply(tests, art);
          tl += art.length - 1;
          z -= 1;
        }
      }
    }
    this.tcLength = tests.length;
    return this;
  }

  /**
   * execute next or specific test case
   */
  next(nextTc) {
    if (!this.stopped) {
      if (typeof nextTc === 'number') {
        this.nextTc = nextTc;
      } else {
        this.nextTc += 1;
      }
      if (this.nextTc < this.tcLength) {
        this.emit('load:tc');
        const tc = new TestCase(this, this.tests[this.nextTc]);
        tc.exec();
      } else {
        this.end();
      }
    }
    return this;
  }

  /**
   * start the execution of test cases
   */
  start() {
    this.stopped = false;
    this.next();
    return this;
  }

  /**
   * stop the execution of test cases
   */
  stop() {
    this.stopped = true;
    return this;
  }

  /**
   * abort the execution of test cases
   */
  abort() {
    this.emit('abort');
    this.end();
    this.emit('aborted');
    return this;
  }

  /**
   * end the execution of test cases
   */
  end() {
    this.runner.removeListener('abort', this.abortFunction);
    this.runner.removeListener('stop', this.stopFunction);
    this.runner.removeListener('start', this.startFunction);
    this.runner.load();
    return this;
  }
}

export default TestSuite;
