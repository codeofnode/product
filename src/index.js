import http from 'http';
import https from 'https';
import { resolve } from 'path';
import requireAll from 'require-all';
import defaultVars from './vars.json';
import appImport from './appImport';

const replace = appImport('petu/str/replace');

/**
 * @module Json2Server
 */

/**
  * The Json2Server class
  * @class
  */

class Json2Server {
  /**
   * Create an instance of Json2Server class
   * @param {Object} config - configuration to initiate the json2server instance
   */
  constructor(vars = {}) {
    const appVars = Object.assign({}, defaultVars.app, vars.app || vars);
    const allVars = Object.assign({}, defaultVars, vars);
    replace(appVars, allVars);
    replace(allVars, allVars);
    if (process.env.PORT) {
      const port = Number(process.env.port);
      if (!isNaN(port) && port > 0) appVars.port = port;
    }
    allVars.app = appVars;
    Object.assign(this, appVars);
    if (appVars.load !== false) {
      this.laod(allVars);
    } else {
      this._allVars = allVars;
    }
  }

  /**
   * loads all the modules
   */
  load() {
    this._modules = requireAll({
      dirname: resolve(this.rootDir),
      resolve() {
      },
    });
    this.strVars = JSON.stringify(allVars);
  }
}
