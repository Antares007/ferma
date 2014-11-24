#!/usr/bin/env node
var xlsx = require('./xlsx-export.js');
var argv = require('yargs').argv;
var fs = require('fs');

fs.readFile(argv._[0], 'utf8', function(err, data){
  if(err) { throw err; }
  fs.writeFile(argv._[1], xlsx(JSON.parse(data)), {encoding: 'binary'}, function(err){
    if(err) { throw err; }
  });
});
