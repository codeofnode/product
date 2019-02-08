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
   * @param {Object} config - the options object to initialize Allrounder
   * @param {Object[]} [config.testsuites] the array of test suite files to test
   * @param {String} [config.outVarsPath=] save the vars to a file at end of test execution
   */
  constructor(config = {}) {
    super();
    const conf = Object.assign({}, config, defaultConf, config);
    this.emit('initialize', conf);
    this.stopped = false;
    this.runnerVars = JSON.stringify(conf.vars);
    const ts = (Array.isArray(conf.testsuites) ? conf.testsuites : [])
      .map(ob => Object.assign({}, conf, typeof ob === 'object' ? ob : {}, {
        vars: Object.assign(JSON.parse(this.runnerVars), ob.vars),
      })).map(ob => (({
        testsuites, runnerOptions, outVarsPath, ...others
      }) => ({ ...others }))(ob));
    if (typeof this.dir === 'undefined') {
      this.dir = process.cwd();
    }
    this.testsuites = ts;
    this.tsLength = ts.length;
    if (typeof conf.outVarsPath === 'string') {
      this.outVarsPath = resolve(conf.outVarsPath);
    }
    this.nextTs = -1;
    this.emit('initialized', conf);
  }

  /**
   * load next or a particular test suite
   * @param {Number} nextTs - next test suite index
   */
  next(nextTs) {
    if (!this.stopped) {
      if (typeof nextTs === 'number') {
        this.nextTs = nextTs;
      } else {
        this.nextTs += 1;
      }
      if (this.nextTs < this.tsLength) {
        this.emit('load:ts');
        const ts = new TestSuite(this, this.testsuites[this.nextTs]);
        ts.load();
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
    this.emit('stop');
    this.stopped = true;
    this.emit('stopped');
    return this;
  }

  /**
   * abort the execution of test cases
   */
  abort() {
    this.emit('abort');
    this.emit('aborted');
    this.end();
    return this;
  }

  /**
   * save the variables on the file
   */
  save() {
    if (this.outVarsPath) {
      writeFileSync(
        this.outVarsPath,
        `${JSON.stringify(Object.assign(
          {},
          ...this.testsuites.map(ts => ts.vars),
        ), null, 2)}\n`,
      );
    }
    return this;
  }

  /**
   * end the execution of test cases
   */
  end() {
    this.emit('end');
    this.save();
    this.emit('ended');
    return this;
  }
}

export default Allrounder;
