import fs from 'fs';
import { join } from 'path';

/**
 * @module petu
 */

const secs = fs.readdirSync(join(__dirname))
  .filter(sec => (!sec.startsWith('.') && !sec.endsWith('.js')));

secs.forEach((sec) => {
  exports[sec] =
    require(join(__dirname, sec)); // eslint-disable-line import/no-dynamic-require,global-require
  Object.entries(exports[sec]).forEach(([ky, vl]) => {
    exports[ky] = vl;
  });
});
