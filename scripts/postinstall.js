const exec = require('child_process').execSync;
const mv = require('mv');
const symlink = require('fs').symlinkSync;
const rimrafSync = require('rimraf').sync

const pkg = require('../package.json');
let conf = require('./conf');
if (!conf.module || typeof conf.module.dependencies !== 'object') return;

const deps = Object.entries(conf.module.dependencies)

if (!deps.length) return;

function resolveDeps(ind, cb) {
  if (ind === deps.length) return cb();
  const [ky, vl] = deps[ind];
  const diffRep = exec('git diff').toString();
  if (diffRep.indexOf('package.json') !== -1) {
    exec('git commit -am "package.json new line fix"');
  }
  exec(`git checkout ${ky}-v${vl}`);
  exec('node scripts/postinstall');
  exec('npm run build');
  rimrafSync(`node_modules/${conf.module.prefix}${ky}`);
  mv('dist', `node_modules/${conf.module.prefix}${ky}`, {mkdirp: true}, function(err) {
    if (err) throw err;
    const mod = require(`${conf.module.prefix}${ky}/package.json`);
    if (typeof mod.bin === 'object') {
      for (const [bk, bv] of Object.entries(mod.bin)) {
        symlink(`node_modules/.bin/${bk}`, `node_modules/${conf.module.prefix}${ky}/${bv}`)
      }
    }
    resolveDeps(ind + 1, cb);
  });
}

const stdout = exec('git rev-parse --abbrev-ref HEAD').toString().trim();
const [ l ] = stdout.split('-');
if (l === conf.name) {
  resolveDeps(0, () => {
    exec(`git checkout ${stdout}`);
  });
}
