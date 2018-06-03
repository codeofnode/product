import { join, isAbsolute } from 'path';

/**
 * @module pathResolver
 */

class PathResolver {
  /**
   * Resolves the path
   * @param {String} st - the input string
   * @param {String} defaultPath - to be used in case the main input string is absent
   * @return {String} the resolved path
   */
  static resolve(st, defaultPath) {
    let str = st;
    if (typeof str !== 'string' || !str.length) {
      str = defaultPath;
    }
    if (!isAbsolute(str)) {
      str = join(process.cwd(), str);
    }
    return str;
  }
}

export default PathResolver.resolve;
export { PathResolver };
