import { writeFileSync, readdirSync, readFileSync } from 'fs';
import pkg from '../package.json';

delete pkg.devDependencies;
delete pkg.scripts;
delete pkg.nyc;
delete pkg.babel;

const secs = readdirSync('./src')
  .filter(sec => (!sec.startsWith('.') && !sec.endsWith('.json') && !sec.endsWith('.js')));
const secIndexStr = readFileSync('./scripts/static/section.js').toString();

try {
  secs.forEach(sec => writeFileSync(`./dist/${sec}/index.js`, secIndexStr, { flag: 'wx' }));
} catch (er) {
  if (er.errno !== -17) throw er;
}

writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2)+'\n');
