//#!/usr/bin/env node
var argv = require('yargs')
  .usage('Usage: $0 -outDir [path]')
  .demand(['outDir'])
  .argv;
var fs = require('fs');
var split2 = require('split2');
var path = require('path');
var mkdirp = require('mkdirp');
var xlsx = require('./xlsx-importer');
var t = require('through2');
var _ = require('lodash');

process.stdin
  .pipe(split2())
  .pipe(t.obj(function(filePath, enc, next){
    var ds = this;
    fs.readFile(filePath, (err, buffer) => {
      if (err) {
        throw err;
      }
      this.push({ path: filePath, buffer: buffer });
      next();
    });
  }))
  .pipe(t.obj(function(file, enc, next){
    var data = file.buffer.toString('binary');
    var emitedStreams = {};
    var ds = this;
    var emit = function(key, value) {
      if(!emitedStreams[key]) {
        emitedStreams[key] = [value];
      } else {
        emitedStreams[key].push(value);
      }
      ds.push({key: key, value: value });
    };
    var padLeft = function (nr, n, str){ return new Array(n-String(nr).length+1).join(str||'0')+nr; };
    var formatDate = function (d) { return d.getUTCFullYear() + '' + padLeft(d.getUTCMonth() + 1, 2) + '' + padLeft(d.getUTCDate(), 2); };

    var rows = xlsx(data)[0].rows()
      .filter(row => row.filter(cell => cell).length > 0)
      .reduce((gs, row) => (row[1] && row[2] ? gs.unshift([row]) : gs[0].push(row), gs), [])
      .filter(group => !isNaN(parseInt(group[0][1], 10)))
      .forEach(group => {
        var mogebebi = _.flatten(
          group
          .filter(row => row[6] && row[7] && row[8] && row[10])
          .map(row => row[7].trim().split('/')
               .map(skesi => ({
                 n: formatDate(new Date(row[6])) + skesi.trim()[0] + row[10],
                 dabDge: row[6],
                 skesi: skesi.trim(),
                 mama: row[10]
               })))
        );
        emit(group[0][1], {
          skesi: group[0][2],
          dabDge: group[0][3],
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
            deda: group[0][1]
          });
        });
      });
      next();
  }))
  .pipe((function(){
    var pushedKeys = {};
    return t.obj(function(o, enc, next){
      var data = JSON.stringify(o.value) + '\n';
      var file = argv.outDir + '/' + o.key.toString() + '.json';
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
