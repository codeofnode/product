import TestSuite from './testsuite';
import appImport from './appImport';

const pick = appImport('petu/obj/pick').default;

/**
 * @module allrounder
 */

/**
  * The Allrounder class
  * @class
  */

class Allrounder {
  /**
   * Create an instance of Extractor class
   * @param {Object} conf - the config path or the options object
   * @param {String[]} conf.testsuites the array of json files to test
   * @param {String} conf.testsuites[].filePath the path of the json test suite file
   * @param {Number[]} [conf.testsuites[].steps=[]] the test steps to execute
   * @param {Number} [conf.bail=0] whether to bail on first failure
   * @param {Number} [conf.stacktrace=0] whether to print stacktrace in case of failure
   * @param {Number} [conf.timeout=1000] to set the default timeout
   * @param {Number} [conf.whileInterval=1000] in case of while looping how much interval gap between test cases
   * @param {String} [conf.type=rset] what kind of validation is it
   * @param {String} [conf.debug=] what info to console all the tests
   * @param {String} [conf.debugOnFail=] what info to console for failed test
   * @param {Object} [conf.vars=] the input variable to start with
   * @param {Object} [conf.mocha=] the mocha options to passed to mocha
   * @param {String} [conf.outVarsPath=] save the vars to a file at end of test execution
   */
  constructor(conf) {
    Object.assign(this, {
      testsuites: [].map(ob => Object.assign({ filePath: '', steps: [] }, ob)),
      bail: 0,
      stacktrace: 0,
      timeout: 1000,
      whileInterval: 1000,
      type: 'rest',
      debug: '',
      debugOnFail: '',
      mocha: {},
      vars: {},
      outVarsPath: '',
    }, conf);
  }

  /**
   * load the test cases
   */
  load() {
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

module.exports = Allrounder;

if (process.env.ALLROUNDER_CONFIG_PATH) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const config = require(resolvePath(process.env.ALLROUNDER_CONFIG_PATH));
  const allrounder = new Allrounder(config);
  generator.load().start();
  exports.default = allrounder;
}

// export default Generator;
