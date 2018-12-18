import EventEmitter from 'events';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import TestSuite from './testsuite';
import defaultConf from './default.json';
import appImport from '../appImport';

/**
 * @module allrounder
 */

/**
  * The Allrounder class
  * @class
  */

class Allrounder extends EventEmitter {
  /**
   * Create an instance of Allrounder class
   * @param {Object} conf - the options object to initialize Allrounder
   * @param {Object[]} [conf.testsuites] the array of test suite files to test
   * @param {String} [conf.outVarsPath=] save the vars to a file at end of test execution
   */
  constructor(conf) {
    super();
    Object.assign(conf, defaultConf, conf);
    const testsuites = (Array.isArray(conf.testsuites) ? conf.testsuites : [])
      .map(ob => Object.assign({}, conf, ob, {
        vars: Object.assign({}, conf.vars, ob.vars),
        testsuites: undefined,
        runnerOptions: undefined,
        outVarsPath: undefined,
      }));
    this.vars = JSON.parse(JSON.stringify(conf.vars));
    if (typeof this.dir === 'undefined') {
      this.dir = process.cwd();
    }
    this.testsuites = testsuites;
    if (typeof conf.outVarsPath === 'string') {
      this.outVarsPath = resolve(conf.outVarsPath);
    }
    this.emit('initialized', conf);
  }

  /**
   * load the test cases
   */
  load() {
    this.emit('loading');
    this.testsuites.forEach(ts => (new TestSuite(this, ts)));
    this.emit('loading-testsuites');
    this.emit('loaded');
    return this;
  }

  /**
   * start the execution of test cases
   */
  start() {
    this.emit('starting');
    this.emit('started');
    return this;
  }

  /**
   * stop the execution of test cases
   */
  stop() {
    this.emit('stopping');
    this.save();
    this.emit('stopped');
    return this;
  }

  /**
   * save the variables on the file
   */
  save() {
    Object.assign(this.vars, ...this.testsuites.map(ts => ts.vars));
    if (this.outVarsPath) {
      writeFileSync(this.outVarsPath, `${JSON.stringify(this.vars, null, 2)}\n`);
    }
    return this;
  }

  /**
   * end the execution of test cases
   */
  end() {
    this.emit('ending');
    this.save();
    this.emit('ended');
    return this;
  }
}

export default Allrounder;
