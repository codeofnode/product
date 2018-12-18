import { readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import defaultConf from '../default.json';
import TestCase from '../testcase';
import appImport from '../appImport';

const { isDict } = appImport('petu/obj/pojo').Pojo;
const stringify = appImport('petu/str/stringify');

const TSCacheMap = {};

/**
 * @module testsuite
 */

/**
  * The Test suite class
  * @class
  */

class TestSuite {
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
    this.runner = runner;
    this.dir = dirname(this.filePath);
    this.jsonVarsString = stringify(this.vars);
    if (options.listenEvents !== false) {
      runner.once('loading-testsuites', this.load.bind(this));
      runner.once('loaded', this.afterAllLoaded.bind(this));
      runner.on('starting', this.start.bind(this));
      runner.on('stopping', this.stop.bind(this));
      runner.once('end', this.end.bind(this));
    }
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
      } else if (isDict(json)) {
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
    Object.assign(this.vars, JSON.parse(this.jsonVarsString));
    const tl = this.tests.length;
    const tests = this.tests;
    for (let z = 0; z < tl; z++) {
      const steps = tests[z].steps;
      if (typeof tests[z].import === 'string' && !replace(tests[z].disabled, Object.assign(fl.vars || {}, vars))) {
        if (!tests[z].import.endsWith('.json')) {
          tests[z].import += '.json';
        }
        let arp = getArp(options.jsondir, tests[z].import);
        let ar = JSON.parse(arp[3]);
        if (tests[z].fetchVars !== false) {
          if (typeof ar.vars === 'object' && ar.vars !== null) {
            fl.vars = Object.assign({}, ar.vars, fl.vars);
          }
          if (typeof arp[2] === 'object' && arp[2] !== null) {
            fa[2] = Object.assign({}, arp[2], fa[2]);
          }
        }
        if (tests[z].fetchVars === true) {
          tests[z].disabled = true;
          continue;
        }
        if (!Array.isArray(ar)) {
          ar = getTests(ar);
        }
        if (Array.isArray(ar)) {
          if (steps !== undefined) {
            const art = [];
            if (Array.isArray(steps)) {
              steps.forEach(st => {
                if (typeof st === 'number' && ar[st]) {
                  let toPush = createNewStep(tests[z], getNthActiveElement(ar, st));
                  if (toPush) art.push(toPush);
                }
              });
            } else if (typeof steps === 'object' && steps !== null
                && (typeof steps.from === 'number' || typeof steps.to === 'number')) {
              let ffrom = getNthActiveElement(ar, steps.from || 0, true);
              let fto = typeof steps.to !== 'number' ? ar.length - 1 : getNthActiveElement(ar, steps.to, true);
              for (let st = ffrom; ar[st] && st <= fto; st++) {
                let toPush = createNewStep(tests[z], ar[st]);
                if (toPush) art.push(toPush);
              }
            } else if (typeof steps === 'number' && ar[steps]) {
              toPush = createNewStep(tests[z], getNthActiveElement(ar, steps));
              if (toPush) art.push(toPush);
            }
            ar = art;
            tests.splice.bind(tests, z, 1).apply(tests, ar);
          } else {
            tests.splice.bind(tests, z, 1).apply(tests, ar.map(createNewStep.bind(null, tests[z])));
          }
          ln += ar.length - 1;
          z--;
        }
      }
    }
    return this;
  }

  /**
   * start the execution of test cases
   */
  start() {
    console.log(this)
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
