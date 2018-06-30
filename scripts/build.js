import { writeFileSync, readFileSync } from 'fs';
import pkg from '../package.json';
import { sync as rimrafSync } from 'rimraf'

const isServer = process.argv.indexOf('-s') === 2;
let removeComponents = [];

if (isServer && process.argv.indexOf('-r') === 3) {
  removeComponents = process.argv.splice(4);
}

delete pkg.devDependencies;
delete pkg.scripts;
delete pkg.nyc;
delete pkg.babel;

const secIndexStr = readFileSync('./scripts/static/section.js').toString();
if (isServer) {
  const serverJson = require('../src/server.json');
  serverJson.$ = { name: pkg.name, version: pkg.version }

  const varsJson = require('../src/vars.json');
  varsJson.app.baseUrl = `/v${pkg.version.split('.').shift()}`;

  pkg.scripts = { start: './node_modules/.bin/json2server' };

  removeComponents.forEach((ky) => {
    delete serverJson[ky];
    rimrafSync(`dist/${ky}`);
  });

  writeFileSync('dist/server.json', JSON.stringify(serverJson, null, 2)+'\n');
  writeFileSync('dist/vars.json', JSON.stringify(varsJson, null, 2)+'\n');
}

writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2)+'\n');
try {
  writeFileSync('./dist/utils/index.js', secIndexStr, { flag: 'wx' });
} catch (er) {
  if (er.errno !== -17) throw er;
}
