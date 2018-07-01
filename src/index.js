import http from 'http';
import https from 'https';
import { sep, join, resolve } from 'path';
import defaultVars from './vars.json';
import packageJson from './package.json';
import appImport from './appImport';

const replace = appImport('petu/str/replace');
const FsWalk = appImport('petu/fs/walk').Walker;
const { fillToLast, lastValue } = appImport('petu/fs/lastValue').LastMan;

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
   * @param {Object} vars - configuration to initiate the json2server instance
   */
  constructor(vars = {}) {
    Object.assign(this, packageJson.config);
    const allVars = this.resolveVars(vars);
    if (process.env.PORT) {
      const port = Number(process.env.port);
      if (!isNaN(port) && port > 0) {
        this.port = port;
        allVars.app.port = port;
      }
    }
    if (this.loadAtInit !== false) {
      this.laod(allVars);
    } else {
      this._allVars = allVars;
    }
  }

  /**
   * resolves the vars and update the instance
   * @param {Object} vars - the vars from a module
   * @param {Object} [defVars] - the default vars
   * @return {Object} the resolved vars
   */
  resolveVars(vars, defVars = defaultVars) {
    const appVars = Object.assign({}, defVars.app, vars.app || vars);
    const allVars = Object.assign({}, defVars, vars);
    replace(appVars, allVars);
    replace(allVars, allVars);
    allVars.app = appVars;
    Object.assign(this, appVars);
    return allVars;
  }

  /**
   * loading the module
   * @param {Object} vars - the all vars of instance
   * @param {String} file - the file name
   * @param {String} dir - the directory that contains the file
   */
  loadModule(vars, file, dir) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const required = require(join(dir, file));
    const splits = dir.split(sep);
    const modObj = fillToLast(this._root, ...splits);
    const parentObj = lastValue(this._root, ...splits.slice(0, -1));
    const oldMethods = parentObj[this.module.method.key];
    const oldVars = parentObj[this.module.var.key];
    switch(file) {
      case this.module.var.file:
        modObj[this.module.var.key] = Object.assign({}, oldVars, this.resolveVars(required, vars));
        break;
      case this.module.method.file:
        modObj[this.module.method.key] = Object.assign({}, oldMethods, required);
    }
    return false;
  }

  /**
   * loads all the modules
   * @param {Object} vars - the all vars of current instance
   */
  load(vars) {
    this._root = {};
    const fsWalk = new FsWalk(true, this.loadModule.bind(this, vars));
    fsWalk.walkSync(resolve(this.rootDir));
    this._modules = requireAll({
      dirname: ,
      resolve() {
      },
    });
    this.strVars = JSON.stringify(allVars);
  }
}
