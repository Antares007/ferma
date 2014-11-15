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


process.stdin
  .pipe(split2())
  .pipe(t.obj(function(path, enc, next){
    var ds = this;
    fs.readFile(path, function (err, data) {
      if (err) {
        throw err;
      }
      ds.push(data);
      next();
    });
  }))
  .pipe(t.obj(function(data, enc, next){
    this.push(JSON.parse(data));
    next();
  }))
  .pipe(t.obj(function(rows, enc, next){
    var ds = this;
    var emit = function(key, value) {
      ds.push({key: key, value: value});
    };
    var padLeft = function (nr, n, str){ return new Array(n-String(nr).length+1).join(str||'0')+nr; };
    var formatDate = function (d) { return d.getUTCFullYear() + '' + padLeft(d.getUTCMonth() + 1, 2) + '' + padLeft(d.getUTCDate(), 2); };

    var mogebebi = _.flatten(rows
      .filter(function(row){ return row[6] && row[7] && row[8] && row[10]; })
      .map(function(row){
        return row[7].trim().split('/').map(function(skesi){
          return {n: formatDate(new Date(row[6])) + skesi.trim()[0] + row[10], dabDge: row[6], skesi: skesi.trim(), mama: row[10]};
        });
      }));

    emit(rows[0][1], {
      skesi: rows[0][2],
      dabDge: rows[0][3],
      shvilebi: mogebebi.map(function(m){ return m.n; })
    });

    mogebebi.forEach(function(m){
      emit(m.mama, {
        shvilebi: [m.n]
      });
      emit(m.n, {
        skesi: m.skesi,
        dabDge: m.dabDge,
        mama: m.mama,
        deda: rows[0][1]
      });
    });

    next();
  }))
  .pipe((function(){
    var pushedKeys = {};
    return t.obj(function(o, enc, next){
      var data = JSON.stringify(o.value)+'\n';
      var file = argv.outDir+'/'+o.key.toString()+'.json';
      var ds = this;
      fs.appendFile(file, data, function (err) {
        if (err) { throw err; }
        if(!pushedKeys[file]){
          pushedKeys[file] = true;
          ds.push(file + '\n');
        }
        next();
      });
    });
  })())
  .pipe(process.stdout);
