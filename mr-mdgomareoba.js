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
  var value = JSON.parse(file.buffer.toString('utf8'));
  if(value.movlenebi.length === 0) {
    emit(value.n, {name:'tselka', tarigi:value.dabTarigi});
    return;
  }
  emit(value.n, _.max(value.movlenebi, x => Date.parse(x.tarigi)));
  value.movlenebi
    .filter(x => x.name === 'moigo' && x.skesi === 'ფური')
    .forEach(x => emit(x.n,{name:'tselka', tarigi:x.tarigi}));
};

module.exports.reduce = function(key, values){
  return _.max(values, x => Date.parse(x.tarigi));
};

module.exports.transform = function(key, value) {
  return {n: key, boloMovlena: value.name, boloMovlenisTarigi: value.tarigi};
};
