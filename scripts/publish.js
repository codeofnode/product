const { readFileSync, writeFileSync } = require('fs');
const exec = require('child_process').execSync;

const pkg = require('../publish/package.json');
let conf = require('./conf');

delete pkg.private;
delete pkg.config;


if (conf.module && typeof conf.module.dependencies === 'object') {
  const baseBr = exec('git symbolic-ref --short HEAD').toString().trim();
  const dps = Object.entries(conf.module.dependencies);
  for (let z = 0; z < dps.length; z++) {
    const [ky,vl] = dps[z];
    exec(`git checkout ${ky}-v${vl}`);
    const exactVersion = JSON.parse(readFileSync('./package.json').toString()).version;
    pkg.dependencies[ky] = `^${exactVersion}`;
  }
  exec(`git checkout ${baseBr}`);
}


writeFileSync('./publish/package.json', JSON.stringify(pkg, null, 2)+'\n');
