import { mkdirSync, readdirSync, statSync } from 'fs';
import { join, basename, sep, isAbsolute } from 'path';
import { tmpdir } from 'os';
import { name } from './package.json';
import Logger from './logger';
import appImport from './appImport';

const { clonePrimitive } = appImport('petu/obj/pojo').Pojo;
const { Walker } = appImport('petu/fs/walk');
const exec = appImport('petu/func/exec');

/**
 * @module generator
 */

/**
  * The test case generator class
  * @class
  */

class Generator {
  static ignoredStaticMethods = ['length', 'prototype', 'name'];
  static clonePrimitive = clonePrimitive;
  static exec = exec;

  /**
   * Create an instance of Import Manager class
   * @param {String} srcPath - the path where source exists
   * @param {String[]} noClassFiles - the files that are not classes
   * @param {String} outPath - the path where test cases will be written
   */
  constructor(srcPath, noClassFiles = [], outPath = join(tmpdir, name)) {
    this.srcPath = srcPath;
    let sp = srcPath;
    let op = outPath;
    if (!isAbsolute(sp)) sp = join(process.cwd(), sp);
    if (!isAbsolute(op)) op = join(process.cwd(), op);
    const outDirName = sp.split(sep).slice(-3).join('-');
    this.outDirPath = join(op, outDirName);
    try {
      mkdirSync(op);
      mkdirSync(this.outDirPath);
    } catch (er) {
      // nothing to do
    }
    const walker = new Walker(true, this.ifFileToCapture.bind(this));
    this.filelist = walker.walk(sp);
  }

  /**
   * whether to capture the file or not
   * @param {String} file - the file name
   * @param {String} dir - the directory name
   */
  ifFileToCapture(file, dir) {
    try {
      mkdirSync(join(dir, file));
    } catch (er) {
      // ignore
    }
    return file.endsWith('.js') && this.noClassFiles.indexOf(file) === -1
  }

  /**
   * Act as the middlemap to intercept the function under test
   * @param {Function} sLogger - the logger function
   * @param {*} ent - the input instance
   * @param {String} prop - method name belongs to ent
   * @param {Boolean} isConstructor - whether the function is constructor
   * @return {Function} the new function that will be used
   */
  static handleFunctionUnderTest(sLogger, ent, prop, isConstructor = false) {
    const applyArgs = [prop, isConstructor, Generator.clonePrimitive(ent), args];
    /**
     * This becomes the original function
     * @param {...*} args - the arguments passed to be function
     */
    return function(...args) {
      const ret = exec(ent, prop, args, (err, ...data) => {
        if (err) {
          applyArgs.push({ error: Generator.clonePrimitive(err) });
        } else {
          applyArgs.push({ output: Generator.clonePrimitive(data.length > 1 ? data : data[0]) });
        }
        sLogger.apply(sLogger, applyArgs);
      }, isConstructor);
      return ret;
    };
  }

  /**
   * load and require the modules
   */
  load() {
    this.filelist.forEach((fl) => {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const loaded = require(fl);
      if (typeof loaded === 'object') {
        Object.entries(loaded).forEach(([ky, ent]) => {
          if (typeof ent === 'function' && ent && typeof ent.prototype === 'object') {
            const srcPath = fl.split(this.srcPath).pop().split(sep);
            const sLogger = new Logger(join(this.outDirPath, ...srcPath),
              srcPath.join(sep), basename(fl));
            Object.getOwnPropertyNames(ent).forEach((prop) => {
              if (Generator.ignoredStaticMethods.indexOf(prop) === -1) {
                ent[prop] = Generator.handleFunctionUnderTest(sLogger, ent[prop].bind(ent));
              }
            });
            Object.getOwnPropertyNames(ent.prototype).forEach((prop) => {
              ent.prototype[prop] = Generator.handleFunctionUnderTest(sLogger,
                ent.prototype[prop].bind(ent.prototype), prop === 'constructor');
            });
          }
        });
      }
    });
  }
}

export default Generator;
