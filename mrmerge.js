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
  var mapers = {
    'genetika': () => emit(v.n, {skesi: v.skesi, dabTarigi: v.dabDge, mama: v.mama, deda: v.deda}),
    'baratebi': () => (1),
    'raodenobebi': () => emit(v.n, v),
    'mdgomareoba': () => emit(v.n, v)
  };
  mapers[file.path.split('/')[1]]();
};

module.exports.reduce = function(key, values){
  return {
    skesi: _.last(_.filter(_.pluck(values, 'skesi'), x => typeof x !== 'undefined')),
    dabTarigi: _.last(_.filter(_.pluck(values, 'dabTarigi'), x => typeof x !== 'undefined')),
    mama: _.last(_.filter(_.pluck(values, 'mama'), x => typeof x !== 'undefined')),
    deda: _.last(_.filter(_.pluck(values, 'deda'), x => typeof x !== 'undefined')),
    boloMovlena: _.last(_.filter(_.pluck(values, 'boloMovlena'), x => typeof x !== 'undefined')),
    boloMovlenisTarigi: _.last(_.filter(_.pluck(values, 'boloMovlenisTarigi'), x => typeof x !== 'undefined')),
    dagrildaRaod: _.last(_.filter(_.pluck(values, 'dagrildaRaod'), x => typeof x !== 'undefined')),
    moigoRaod: _.last(_.filter(_.pluck(values, 'moigoRaod'), x => typeof x !== 'undefined')),
    mkvdradSobiliRaod: _.last(_.filter(_.pluck(values, 'mkvdradSobiliRaod'), x => typeof x !== 'undefined'))
  };
};

module.exports.transform = function(key, value) {
  return (value.n = key, value);
};
