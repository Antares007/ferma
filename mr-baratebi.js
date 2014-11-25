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
  var data = file.buffer.toString('binary');
  var rows = xlsx(data)[0].rows()
    .filter(row => row.filter(cell => cell).length > 0)
    .map(row => ({
      n: row[1],
      skesi: row[2],
      dabTarigi: row[3],
      dagrileba: row[5],
      mogeba: row[6],
      mogSkesi: row[7],
      mogRaodenoba: row[8],
      mogN: row[9],
      bugaMtsa: row[10],
      dakvla: row[11]
    }))
    .reduce((gs, row) => (row.n && row.skesi ? gs.unshift([row]) : gs[0].push(row), gs), [])
    .filter(group => isInt(group[0].n))
    .forEach(group => {
      var events = [];
      var record = events.push.bind(events);
      for(var row of group){
        if(isValidDate(row.dagrileba)){
          record({name: 'dagrilda', tarigi: row.dagrileba, bugaMtsa: row.bugaMtsa});
          if(isValidDate(row.mogeba) || parseInt(row.mogRaodenoba, 10) === 1){
            record({name: 'daorsulda', tarigi: row.dagrileba, bugaMtsa: row.bugaMtsa});
          } else if(parseInt(row.mogRaodenoba, 10) === 0){
            record({name: 'verdaorsulda', tarigi: row.dagrileba, bugaMtsa: row.bugaMtsa});
          }
        }
        if(isValidDate(row.mogeba) && row.mogSkesi && parseInt(row.mogRaodenoba,10) >= 0){
          record({
            name:'moigo',
            n: row.mogN || (formatDate(row.mogeba) + row.mogSkesi[0] + row.bugaMtsa),
            skesi: row.mogSkesi.trim(),
            tarigi: row.mogeba,
            raodenoba: row.mogRaodenoba,
            bugaMtsa: row.bugaMtsa
          });
        }
      }
      emit(group[0].n, {dabTarigi:group[0].dabTarigi, skesi:group[0].skesi.trim(), movlenebi: events});
    });
};
module.exports.reduce = function(key, values){
  return {
    dabTarigi: _.last(_.filter(_.pluck(values, 'dabTarigi'))),
    skesi: _.last(_.filter(_.pluck(values, 'skesi'))),
    movlenebi: _.flatten(_.pluck(values, 'movlenebi'))
  };
};
module.exports.transform = function(key, value) {
  return (value.n = parseInt(key, 10), value);
}
