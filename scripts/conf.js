let conf = require('../conf.json');
let confStr = JSON.stringify(conf);

[ 'name', 'srcDir', 'module.dirName', 'git.hostedOn', 'git.owner',
  'org.scheme', 'org.domain', 'org.url',
].forEach((key, ind) => {
  const [l, r] = key.split('.');
  confStr = confStr.split(`{{${key}}}`).join(ind ? conf[l][r] : conf[key]);
  conf = JSON.parse(confStr);
});

module.exports = conf;
