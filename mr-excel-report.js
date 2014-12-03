var _ = require('lodash');

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
