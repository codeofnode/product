/* eslint no-console:0 */
import pkg from '../package.json';

/**
 * @module Logger
 */

/**
 * The Logger class
 * @class
 */
class Logger {
  /**
   * Create an instance of Logger class
   * @param {loglevel} loglevel - the log level (prod: 0, stage: 1, dev: 2 )
   */
  constructor(loglevel) {
    this.loglevel = Number(loglevel);
  }

  /**
   * log the errors
   */
  error(...args) {
    if (this.loglevel >= 0) {
      console.error(...args);
    }
  }

  /**
   * log the warning
   */
  warn(...args) {
    if (this.loglevel > 0) {
      console.warn(...args);
    }
  }

  /**
   * debugging logs
   */
  log(...args) {
    if (this.loglevel > 1) {
      console.log(...args);
    }
  }
}

const logLevel = pkg.config && pkg.config.logLevel;
if (logLevel === undefined) logLevel = 2;
const logger = new Logger(logLevel);

export default logger;
export { Logger };
