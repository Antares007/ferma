var _ = require('lodash');

module.exports.map = function(file, emit){
  var value = JSON.parse(file.buffer.toString('utf8'));
  emit(value.n, {
    dagrildaRaod: value.movlenebi.filter(x => x.name === 'dagrilda').length,
    moigoRaod: value.movlenebi.filter(x => x.name === 'moigo').reduce((a, x) => a + x.raodenoba, 0),
    mkvdradSobiliRaod: value.movlenebi.filter(x => x.name === 'moigo' && x.raodenoba === 0).length
  });
};

module.exports.reduce = function(key, values){
  return values.reduce((a, v) => {
    a.dagrildaRaod += v.dagrildaRaod;
    a.moigoRaod += v.moigoRaod;
    a.mkvdradSobiliRaod += v.mkvdradSobiliRaod;
    return a;
  }, {
    dagrildaRaod: 0,
    moigoRaod: 0,
    mkvdradSobiliRaod: 0
  });
};

module.exports.transform = function(key, value) {
  return (value.n = key, value);
};
