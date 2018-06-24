import fs from 'fs';
import { join } from 'path';

/**
 * @module section
 */

const files = fs.readdirSync(join(__dirname))
  .filter(file => (!file.startsWith('.') && file.endsWith('.js') && file !== 'index.js'));

files.forEach((file) => {
  exports[file.slice(0, -3)] =
    require(join(__dirname, file)) // eslint-disable-line import/no-dynamic-require,global-require
      .default;
});
