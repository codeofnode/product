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
   * @return {Object} the instance the module
   */
  load(mod) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(`${this.modulePrefix}${mod}`);
  }
}

const manager = (new Manager((pkg.config && pkg.config.modulePrefix) || ''));
const appImport = manager.load.bind(manager);

export default appImport;
export { Manager };
