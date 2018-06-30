import { join, resolve } from 'path'
import Json2Server from '../index'

let config = process.env.J2S_SERVER_CONFIG_PATH;
if (typeof config !== 'string') config = resolve(process.cwd(), 'vars.json');

try {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  config = require(config);
} catch (er) {
  // ignore
}

const server = new Json2Server(config);

server.load().run();
