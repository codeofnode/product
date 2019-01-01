import EventEmitter from 'events';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import TestSuite from './testsuite';
import defaultConf from './default.json';

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
  constructor(conf = {}) {
    super();
    conf = Object.assign({}, conf, defaultConf, conf);
    this.emit('initializing', conf);
    this.runnerVars = JSON.stringify(conf.vars);
    const testsuites = (Array.isArray(conf.testsuites) ? conf.testsuites : [])
      .map(ob => Object.assign({}, conf, typeof ob === 'object' ? ob : {}, {
        vars: Object.assign(JSON.parse(this.runnerVars), ob.vars),
        testsuites: undefined,
        runnerOptions: undefined,
        outVarsPath: undefined,
      }));
    if (typeof this.dir === 'undefined') {
      this.dir = process.cwd();
    }
    this.testsuites = testsuites;
    this.tsLength = this.testsuites.length;
    if (typeof conf.outVarsPath === 'string') {
      this.outVarsPath = resolve(conf.outVarsPath);
    }
    this.nextTs = 0;
    this.emit('initialized', conf);
  }

  /**
   * load next test suite
   */
  load() {
    if (this.nextTs < this.tsLength) {
      this.emit('loading');
      const ts = new TestSuite(this, this.testsuites[this.nextTs]);
      ts.start();
      this.nextTs = ts.next();
    } else {
      this.end();
    }
    return this;
  }

  /**
   * start the execution of test cases
   */
  start() {
    this.stopped = false;
    this.load();
    return this;
  }

  /**
   * stop the execution of test cases
   */
  stop() {
    this.emit('stopping');
    this.stopped = true;
    this.emit('stopped');
    return this;
  }

  /**
   * abort the execution of test cases
   */
  abort() {
    this.emit('aborting');
    this.save();
    this.emit('aborted');
    return this;
  }

  /**
   * save the variables on the file
   */
  save() {
    Object.assign({}, ...this.testsuites.map(ts => ts.vars));
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
