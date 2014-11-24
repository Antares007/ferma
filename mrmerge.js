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
    'mdgomareoba': () => emit(v.n, {boloMovlena: v.boloMovlena, boloMovlenisTarigi: v.boloMovlenisTarigi})
  };
  mapers[file.path.split('/')[1]]();
};

module.exports.reduce = function(key, values){
  return {
    skesi: _.last(_.filter(_.pluck(values, 'skesi'))),
    dabTarigi: _.last(_.filter(_.pluck(values, 'dabTarigi'))),
    mama: _.last(_.filter(_.pluck(values, 'mama'))),
    deda: _.last(_.filter(_.pluck(values, 'deda'))),
    boloMovlena: _.last(_.filter(_.pluck(values, 'boloMovlena'))),
    boloMovlenisTarigi: _.last(_.filter(_.pluck(values, 'boloMovlenisTarigi')))
  };
};

module.exports.transform = function(key, value) {
  return (value.n = key, value);
};
