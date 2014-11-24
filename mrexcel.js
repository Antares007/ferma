var _ = require('lodash');
var xlsx = require('./xlsx-importer');

var padLeft = (value, length) =>
  value.toString().length < length ?  padLeft("0" + value, length) : value;
var formatDate = (d) => [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate()
  ].map(x => padLeft(x.toString(), 2)).join('');

var isValidDate = function(d){
  if(Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime())) {
    return true;
  }
  return false;
};
var isInt = function(v) { return !isNaN(parseInt(v, 10));};

module.exports.map = function(file, emit){
  var v = JSON.parse(file.buffer.toString('utf8'));
  emit('array',{keys: Object.keys(v), rows: [v]});
};

module.exports.reduce = function(key, values){
  return {
    keys: _.uniq(_.flatten(_.pluck(values, 'keys'))),
    rows: _.flatten(_.pluck(values, 'rows'))
  };
};

module.exports.transform = function(key, value) {
  var arr = [value.keys];
  for(var o of value.rows){
    var row = [];
    arr.push(row);
    for(var key of value.keys){
      row.push(o[key]);
    }
  }
  return arr;
};
