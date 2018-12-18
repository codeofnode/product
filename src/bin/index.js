import { resolve } from 'path';
import Allrounder from '../index';


let config = process.env.ALLROUNDER_CONFIG_PATH;
if (typeof config !== 'string') config = resolve(process.cwd(), 'allrounder.json');

try {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  config = require(config);
} catch (er) {
  // ignore
}

const allrounder = new Allrounder(config);

allrounder.load().start();
