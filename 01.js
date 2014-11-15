#!/usr/bin/env node
var argv = require('yargs').argv;
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var xlsx = require('./xlsx-importer');
var t = require('through2');
var _ = require('lodash');


process.stdin
  .pipe((function(){
    var data = '';
    return t.obj(function(chunk, enc, next){
      data += chunk.toString('binary');
      next();
    }, function(next){
      this.push(data);
      next();
    });
  })())
  .pipe(t.obj(function(data, enc, next){
    this.push(xlsx(data)[0].rows());
    next();
  }))
  .pipe(t.obj(function(rows, enc, next){
    var ds = this;
    rows.forEach(function(row){
      if(row.filter(function(c){return c;}).length > 0 ){
        ds.push(row);
      }
    });
    next();
  }))
  .pipe((function(){
    var group = [];
    return t.obj(function(row, enc, next){
      if(row[1] && row[2]){
        if(group.length > 0){
          this.push(group);
        }
        group = [row];
      } else {
        group.push(row);
      }
      next();
    }, function(next){
      this.push(group);
      next();
    });
  })())
  .pipe(t.obj(function(g, enc, next){
    var outDir = 'out';
    var key = parseInt(g[0][1], 10);
    if(_.isNaN(key)) {
      return next();
    }
    var fileName = key.toString() + '.json';
    var fpath = path.join(outDir, fileName);
    var ds = this;
    mkdirp('out', function(err){
      fs.writeFile(fpath, JSON.stringify(g), {flags: 'w'}, function (err) {
        if (err) {
          throw err;
        }
        ds.push(fpath + '\n');
        next();
      });
    });
  }))
  .pipe(process.stdout);
