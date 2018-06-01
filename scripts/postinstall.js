const util = require('util');
const exec = require('child_process').execSync;
const mv = require('mv');
const symlink = require('fs').symlinkSync;

const pkg = require('../package.json');
let conf = require('./conf');
if (!conf.module || typeof conf.module.dependencies !== 'object') return;

function resolveDeps(deps, ind, cb) {
  if (ind === deps.length) return cb();
  const [ky, vl] = deps[ind];
  exec(`git checkout ${ky}-v${vl}`);
  exec('node scripts/postinstall');
  exec('npm run build');
  mv('dist', `node_modules/${conf.module.prefix}${ky}`, {mkdirp: true}, function(err) {
    if (err) throw err;
    const mod = require(`${conf.module.prefix}${ky}/package.json`);
    if (typeof mod.bin === 'object') {
      for (const [bk, bv] of Object.entries(mod.bin)) {
        symlink(`node_modules/.bin/${bk}`, `node_modules/${conf.module.prefix}${ky}/${bv}`)
      }
    }
    resolveDeps(deps, ind + 1);
  });
}

const stdout = exec('git rev-parse --abbrev-ref HEAD').toString().trim();
const [ l ] = stdout.split('-');
if (l === conf.name) {
  resolveDeps(Object.entries(conf.module.dependencies), 0, () => {
    exec(`git checkout ${stdout}`);
  });
}
