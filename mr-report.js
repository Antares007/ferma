var _ = require('lodash');

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
