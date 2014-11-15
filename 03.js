#!/usr/bin/env node
var argv = require('yargs')
  .usage('Usage: $0 -outDir [path]')
  .demand(['outDir'])
  .argv;
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var xlsx = require('./xlsx-importer');
var t = require('through2');
var split2 = require('split2');
var _ = require('lodash');
var path = require('path');
var util = require('util');


process.stdin
  .pipe(split2())
  .pipe(t.obj(function(file, enc, next){
    var ds = this;
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        throw err;
      }
      var values = data.split('\n')
        .filter(function(x){ return x.length > 0; })
        .map(function(x){ return JSON.parse(x); });
      ds.push({key: path.basename(file, '.json'), values: values});
      next();
    });
  }))
  .pipe(t.obj(function(data, enc, next){
    var reduce = function(values){
      var shvilebi = _.flatten(_.map(values, function(x){ return x.shvilebi || [];}));
      return {
        dabDge: _.last(_.filter(_.pluck(values, 'dabDge'))),
        mama: _.last(_.filter(_.pluck(values, 'mama'))),
        deda: _.last(_.filter(_.pluck(values, 'deda'))),
        skesi: _.last(_.filter(_.pluck(values, 'skesi'))),
        shvilebi: shvilebi
      };
    };

    this.push({key: data.key, value: reduce(data.values)});
    next();
  }))
  .pipe(t.obj(function(o, enc, next){
    var data = JSON.stringify(o.value)+'\n';
    var file = argv.outDir+'/'+o.key.toString()+'.json';
    var ds = this;
    fs.appendFile(file, data, function (err) {
      if (err) { throw err; }
      ds.push(file + '\n');
      next();
    });
  }))
  .pipe(process.stdout);
