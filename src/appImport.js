import pkg from './package.json';

/**
 * @module appImport
 */

/**
  * The Import manager class
  * @class
  */

class Manager {
  /**
   * Create an instance of Import Manager class
   * @param {String} modulePrefix - the prefix for custom modules
   */
  constructor(modulePrefix) {
    this.modulePrefix = modulePrefix;
  }


  /**
   * initialize or loads a module
   * @param {String} mod - name of the module
   * @param {...*} [opts] - options to initialize the module with
   * @return {Object} the instance the module
   */
  load(mod, ...opts) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    let ToRet = require(`${this.modulePrefix}/${mod}`);
    if (opts.length) ToRet = new ToRet(...opts);
    return ToRet;
  }
}

export default (new Manager(pkg.name));
export { Manager };
