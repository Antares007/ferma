#!/usr/bin/env node
require('traceur').require.makeDefault(function(filename) {
  return filename.indexOf('node_modules') === -1;
}, {'experimental': true, 'sourceMaps': true });

if(process.argv.length > 2 && require('fs').existsSync(process.argv[2])){
  require(require('path').resolve(process.argv[2]));
}
