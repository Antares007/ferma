var _ = require('lodash');
var xlsx = require('./xlsx-importer');

var padLeft = function (nr, n, str){
  return new Array(n-String(nr).length+1).join(str||'0')+nr;
};

var formatDate = function (d){
  return d.getUTCFullYear() + '' + padLeft(d.getUTCMonth() + 1, 2) + '' + padLeft(d.getUTCDate(), 2);
};

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
};
module.exports.reduce = function(key, values){
  var shvilebi = _.flatten(_.map(values, function(x){ return x.shvilebi || [];}));
  return {
    dabDge: _.last(_.filter(_.pluck(values, 'dabDge'))),
    mama: _.last(_.filter(_.pluck(values, 'mama'))),
    deda: _.last(_.filter(_.pluck(values, 'deda'))),
    skesi: _.last(_.filter(_.pluck(values, 'skesi'))),
    shvilebi: shvilebi
  };
};
