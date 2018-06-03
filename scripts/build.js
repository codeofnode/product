import { writeFileSync, readdirSync, readFileSync } from 'fs';
import pkg from '../package.json';

delete pkg.devDependencies;
delete pkg.scripts;
delete pkg.nyc;
delete pkg.babel;

const secs = readdirSync('../src').filter(sec => (!sec.startsWith('.') && !sec.endsWith('.js')));
const secIndexStr = readFileSync('../src/section.js').toString();

secs.forEach(sec => writeFileSync(`../src/${sec}/index.js`, secIndexStr));

writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2));
