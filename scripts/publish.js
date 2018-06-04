const writeFileSync = require('fs').writeFileSync;

const pkg = require('../publish/package.json');
delete pkg.private;
delete pkg.config;
fs.writeFileSync('./publish/package.json', JSON.stringify(pkg, null, 2));
