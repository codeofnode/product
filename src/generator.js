import { mkdirSync, readdirSync, statSync } from 'fs';
import { join, basename, sep, isAbsolute } from 'path';
import { tmpdir } from 'os';
import { name } from './package.json';
import Logger from './logger';
import appImport from './appImport';

const { clonePrimitive } = appImport('petu/obj/pojo').Pojo;

/**
 * @module generator
 */

/**
  * The test case generator class
  * @class
  */

class Generator {
  static ignoredStaticMethods = ['length', 'prototype', 'name'];
  static ignoredProtoMethods = ['constructor'];
  static primitiveTypes = ['number', 'null', 'string', 'boolean'];
  static clonePrimitive = clonePrimitive;

  /**
   * clone a object upto nth level, for primitives properties
   * @param {Object} obj - the input object
   * @param {Number} [level=2] - upto how much depth, cloning required
   * @return {Object} the new object created
   */
  static cloneUpToNthLevel(obj, level = 2) {
    let mainObj;
    let currentPtr;
    if (Generator.primitiveTypes.indexOf(typeof obj) !== -1) {
      return obj;
    }
    Generator.walkObj((fun, rt, obj, key, depth) => {
      if (depth < level) {
        if (typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype) {
          const nextVal = Array.isArray(obj) ? new Array(obj.length) : {}
          if (mainObj === undefined) {
            mainObj = nextVal;
            currentPtr = mainObj;
          } else {
            currentPtr[key] = nextVal;
          }
        } else if (Generator.primitiveTypes.indexOf(typeof obj) !== -1) {
          currentPtr[key] = obj;
        }
      }
    });
    return mainObj;
  },


  /**
   * walk into object function
   * @param {Function} fun - the function to be called on eacy value
   * @param {Object} rt - the root object
   * @param {Object} obj - the input object
   * @param {String} key - the key against which the value is found
   * @param {Number} [depth=0] - the input object
   */
  static walkObj(fun, rt, obj, key, depth = 0){
    fun(obj, key, rt);
    if (typeof obj === 'object' && obj !== null) {
      const kys = Object.keys(obj);
      const kl = kys.length;
      for(let j = 0; j < kl; j++){
        Generator.walkObj(fun, obj, obj[kys[j]], kys[j], depth + 1);
      }
    }
  },

  /**
   * walking recursively in the directory, and capturing the file names
   * @param {String} dir - the path where source exists
   * @param {String|Function} [extension] - what kind of file extension to capture,
   *        it can also be a function that return true or false
   * @param {String[]} [filelist=[]] - the path where test cases will be written
   * @param {Boolean} [absolute=true] - whether to capture absolute path
   * @return {String[]} the absolute path of the files
   */
  static walkSync(dir, extension = () => true, filelist = [], absolute = true) {
    const files = readdirSync(dir);
    files.forEach((file) => {
      if (statSync(join(dir, file)).isDirectory()) {
        filelist = Generator.walkSync(join(dir, file), extension, filelist, absolute);
      } else if (typeof extension === 'function' ? extension(file, dir) : file.endsWith(extension)) {
        filelist.push(absolute ? join(dir, file) : file);
      }
    });
    return filelist;
  }

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
    this.filelist = Generator.walkSync(sp, (file, dir) => {
      try {
        mkdirSync(join(dir, file));
      } catch (er) {
        // ignore
      }
      return file.endsWith('.js') && noClassFiles.indexOf(file) === -1
    });
  }

  /**
   * load and require the modules
   */
  load() {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    this.filelist.forEach((fl) => {
      const loaded = require(fl);
      if (typeof loaded === 'object') {
        Object.entries(loaded).forEach(([ky, ent]) => {
          if (typeof ent === 'function' && ent) {
            if (typeof ent.prototype === 'object') {
              const srcPath = fl.split(this.srcPath).pop().split(sep);
              const sLogger = new Logger(join(this.outDirPath, ...srcPath),
                srcPath.join(sep), basename(fl));
              Object.getOwnPropertyNames(ent).forEach((prop) => {
                if (Generator.ignoredStaticMethods.indexOf(prop) === -1) {
                  const oldFunc = ent[prop].bind(ent);
                  ent[prop] = function (...args) {
                    sLogger(prop, Object.keys(ent).reduce((acc, cur) => {
                      if ()
                      acc[cur] = ent[cur];
                      return acc;
                    }, {}));
                  }
                }
              });
            }
          }
        });
      }
    });
  }
}

export default Generator;
