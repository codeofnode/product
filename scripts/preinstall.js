const fs = require('fs');
const pkg = require('../package.json');
let conf = require('./conf');

['name', 'version', 'description', 'license', 'author', 'keywords', 'homepage', 'config'].forEach((key) => {
  pkg[key] = conf[key]
});

pkg.repository.url = pkg.repository.url.replace('{{git.url}}', conf.git.url);

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
try {
  fs.mkdirSync('./src');
} catch (er) {
  // no error
}
fs.writeFileSync('./src/package.json', JSON.stringify(pkg, null, 2));
