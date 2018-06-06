import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * @module walker
 */

/**
  * The walker class
  * @class
  */
class Walker {
  /* Whether to add absolute path
   * @member {Boolean}
   * @static
   */
  static absolute = true;

  /* All files will be captured so returning true for all
   * @member {String|Function}
   * @static
   */
  static extension = () => true;

  /**
   * Create an instance of walker instance
   * @param {String|Function} [extension] - what kind of file extension to capture,
   *        it can also be a function that return true or false
   * @param {Boolean} [absolute=true] - whether to capture absolute path
   */
  constructor(absolute = Walker.absolute, extension = Walker.extension) {
    /** @member {String|Function} */
    this.extension = extension;
    /** @member {Boolean} */
    this.absolute = absolute;
  }

  /**
   * walking recursively in the directory, and capturing the file names
   * @param {String} dir - the path where source exists
   * @param {String[]} [filelist=[]] - the path where test cases will be written
   * @return {String[]} the absolute path of the files
   */
  walkSync(dir, filelist = []) {
    const files = readdirSync(dir);
    let fls = filelist;
    files.forEach((file) => {
      if (statSync(join(dir, file)).isDirectory()) {
        fls = this.walkSync(join(dir, file), this.extension, fls, this.absolute);
      } else if (typeof this.extension === 'function' ?
        this.extension(file, dir) :
        file.endsWith(this.extension)) {
        fls.push(this.absolute ? join(dir, file) : file);
      }
    });
    return fls;
  }
}

const walker = new Walker();
export default walker.walkSync.bind(walker);
export { Walker };
