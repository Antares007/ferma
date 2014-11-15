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
var xlsxexport = require('./xlsx-export.js');

var jSDateToExcelDate = function (inDate) {
  var returnDateTime = 25569.0 + ((inDate.getTime() ) / (1000 * 60 * 60 * 24));
  return returnDateTime;//.toString().substr(0,20);
};
// =IF(OR(MONTH(NOW())<MONTH(C2),AND(MONTH(NOW())=MONTH(C2),DAY(NOW())<DAY(C2))),YEAR(NOW())-YEAR(C2)-1,YEAR(NOW())-YEAR(C2))
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
  .pipe((function(){
        // dabDge: _.last(_.filter(_.pluck(values, 'dabDge'))),
        // mama: _.last(_.filter(_.pluck(values, 'mama'))),
        // deda: _.last(_.filter(_.pluck(values, 'deda'))),
        // skesi: _.last(_.filter(_.pluck(values, 'skesi'))),
        // shvilebi: shvilebi
    var rows = [
      ['n', 'skesi', 'dabDge', 'mama', 'deda', 'shvilebi']
    ];
    return t.obj(function(data, enc, next){
      var v = data.values[0];
      rows.push([data.key, v.skesi, jSDateToExcelDate(new Date(v.dabDge)), v.mama, v.deda, v.shvilebi.join(',')]);
      next();
    }, function(next){
      this.push(rows);
    });
  })())
  .pipe(t.obj(function(rows, enc, next){
    var wb = xlsxexport(rows);
    this.push(wb);
    next();
  }))
  .pipe(t.obj(function(o, enc, next){
    var ds = this;
    fs.writeFile(argv.outDir+'/message.xlsx', o,{encoding:'binary'}, function (err) {
      if (err) { throw err; }
      ds.push(argv.outDir+'/message.xlsx');
      next();
    });
  }))
  .pipe(process.stdout);
