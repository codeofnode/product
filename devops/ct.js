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

writeFileSync('./README.md', `# ${tool}\n${desc}\n`)

const chStr = readFileSync('./CHANGELOG.md').toString().split('v0').join(`${tool}-v0`).split('HEAD').join(`${tool}-dev`);
writeFileSync('./CHANGELOG.md', chStr);

conf.description = desc;
conf.keywords = tags;
conf.homepage = conf.homepage.split('{{name}}');
conf.homepage[1] = conf.homepage[1] = `/tree/{{name}}`;
conf.homepage = conf.homepage.join(conf.name);
conf.name = tool;
writeFileSync('./conf.json', JSON.stringify(conf, null, 2)+'\n');
