var _ = require('lodash');
var xlsx = require('./xlsx-importer');

var padLeft = (value, length) =>
  value.toString().length < length ?  padLeft("0" + value, length) : value;
var formatDate = (d) => [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate()
  ].map(x => padLeft(x.toString(), 2)).join('');

module.exports.map = function(file, emit){
  var data = file.buffer.toString('binary');
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
                 mama: row[10],
                 deda: group[0][1]
               })))
      );
      emit(group[0][1], {
        skesi: group[0][2],
        dabDge: group[0][3],
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
          deda: group[0][1]
        });
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
