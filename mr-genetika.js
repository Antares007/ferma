var _ = require('lodash');

module.exports.map = function(file, emit){
  var value = JSON.parse(file.buffer.toString('utf8'));
  var mogebebi = value.movlenebi
    .filter(m => m.name === 'moigo' && m.raodenoba > 0)
    .map(m => ({
      n: m.n,
      dabDge: m.tarigi,
      skesi: m.skesi,
      mama: m.bugaMtsa,
      deda: value.n
    }));

    emit(value.n, {
      skesi: value.skesi,
      dabDge: value.dabTarigi,
      ojakhebi: _.groupBy(mogebebi, m => m.mama),
      shvilebi: mogebebi.map(m => m.n)
    });
    _.uniq(_.pluck(mogebebi, 'mama')).forEach(mkey => {
      emit(mkey, {
        ojakhebi: _.groupBy(mogebebi.filter(m2 => m2.mama === mkey), m => m.deda),
        shvilebi: mogebebi.filter(m2 => m2.mama === mkey).map(m => m.n)
      });
    });
    mogebebi.forEach(m => {
      emit(m.n, {
        skesi: m.skesi,
        dabDge: m.dabDge,
        mama: m.mama,
        deda: value.n
      });
    });
};
module.exports.reduce = function(key, values){
  var shvilebi = _.flatten(_.map(values, function(x){ return x.shvilebi || [];}));
  var ojakhebi = {};
  values.forEach(v => {
    if(!v.ojakhebi) return;
    Object.keys(v.ojakhebi).forEach(key => {
      if(ojakhebi[key]){
        ojakhebi[key] = ojakhebi[key].concat(v.ojakhebi[key]);
      } else {
        ojakhebi[key] = v.ojakhebi[key];
      }
    });
  });

  return {
    dabDge: _.last(_.filter(_.pluck(values, 'dabDge'))),
    mama: _.last(_.filter(_.pluck(values, 'mama'))),
    deda: _.last(_.filter(_.pluck(values, 'deda'))),
    skesi: _.last(_.filter(_.pluck(values, 'skesi'))),
    ojakhebi: ojakhebi,
    shvilebi: shvilebi
  };
};
module.exports.transform = function(key, value){
  value.ojakhebi = value.ojakhebi || {};
  value.shvilebi = value.shvilebi || [];
  value.mama = value.mama || 'adam';
  value.deda = value.deda || 'eva';
  value.dabDge = value.dabDge || new Date(Date.UTC(2008,0,1));
  value.skesi = value.skesi || 'ხარი';
  value.n = key;
  return value;
};
