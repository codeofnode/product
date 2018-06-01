const args = process.argv.slice(2);
const { readFileSync, writeFileSync } = require('fs');
const conf = require('../conf.json');

if (args.length < 3) {
  console.log('create-tool.js <name> <description> <comma saparated tags>')
  process.exit(1);
}

const tool = args[0];
const desc = args[1];
const tags = args[2].split(',').map(ab => ab.trim()).filter(ab => ab.length);

writeFileSync('./README.md', `# ${tool}\n${desc}`)

const chStr = readFileSync('./CHANGELOG.md').toString().split('\n');
const nChSt = chStr.slice(0,4)
  .concat([
    '',
    `## [0.0.0] - ${(new Date()).toJSON().slice(0, 10)}`,
    '### Added', '- Created and initialized the project',
    '',
  ])
  .concat(chStr.slice(-3).map((st, ind) => {
    if (ind < 2) {
      const ar = st.split('/');
      const ln = ar.length;
      ar[ln-1] = `${tool}-v0...${tool}-${ind ? 'v0' : 'dev'}`;
      return ar.join('/');
    } else {
      return st;
    }
  }));
writeFileSync('./CHANGELOG.md', nChSt.join('\n'));

conf.name = tool;
conf.description = desc;
conf.keywords = tags;
conf.homepage = conf.homepage.split('{{name}}');
conf.homepage[1] = conf.homepage[1] = `/tree/${tool}`;
conf.homepage = conf.homepage.join('{{name}}');
writeFileSync('./conf.json', JSON.stringify(conf, null, 2)+'\n');
