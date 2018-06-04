/**
 * @module pathResolver
 */

class PathResolver {
  /**
   * Resolves the url slash either at rear or at front
   * @param {String} st - the input string
   * @param {Boolean} [isRear=false] - whether to resolve url slash at rear
   * @param {Boolean} [toRemove=false] - whether to remove slash or not
   * @return {String} the resolved url
   */
  static resolve(st, isRear = false, toRemove = false) {
    let url = st;
    if (typeof url === 'string') {
      if (isRear) {
        if (toRemove) {
          url = url.endsWith('/') ? url.slice(0, -1) : url;
        } else {
          url = url.endsWith('/') ? url : (`${url}/`);
        }
      } else if (toRemove) {
        url = (url.charAt(0) === '/') ? url.slice(1) : url;
      } else {
        url = (url.charAt(0) === '/') ? url : (`/${url}`);
      }
    }
    return url;
  }
}

export default PathResolver.resolve;
export { PathResolver };
