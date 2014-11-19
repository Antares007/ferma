#!/usr/bin/env node
require('traceur').require.makeDefault(function(filename) {
  return filename.indexOf('node_modules') === -1;
}, {'experimental': true, 'sourceMaps': true });
var argv = require('yargs')
  .usage('Usage: $0 --outDir [path] --mrscript [path]')
  .demand(['outDir', 'mrscript'])
  .argv;
var fs = require('fs');
var split2 = require('split2');
var path = require('path');
var t = require('through2');

process.stdin
  .pipe(split2())
  .pipe(t.obj(function(filePath, enc, next){
    var ds = this;
    fs.readFile(filePath, function(err, buffer) {
      if (err) {
        throw err;
      }
      ds.push({ path: filePath, buffer: buffer });
      next();
    });
  }))
  .pipe((function(){
    var mr = require(argv.mrscript);
    var emitedValues = {};
    var emit = function(key, value) {
      if(!emitedValues[key]) {
        emitedValues[key] = value;
      } else {
        emitedValues[key] = mr.reduce(key, [emitedValues[key], value]);
      }
    };
    return t.obj(function(file, enc, next){
      mr.map(file, emit);
      next();
    }, function(next){
      this.push(emitedValues);
      next();
    });
  })())
  .pipe(t.obj(function(emitedValues, enc, next){
    Object.keys(emitedValues)
      .map(function(key) {
        return {
          path: path.join(argv.outDir, key + '.json'),
          buffer: new Buffer(JSON.stringify(emitedValues[key]) + '\n', 'utf8')
        };
      })
      .forEach(this.push.bind(this));
    next();
  }))
  .pipe(t.obj(function(file, enc, next){
    var ds =  this;
    fs.writeFile(file.path, file.buffer, function(err){
      if (err) throw err;
      ds.push(file.path + '\n');
      next();
    });
  }))
  .pipe(process.stdout);
