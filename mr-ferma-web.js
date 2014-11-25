var _ = require('lodash');

var padLeft = (value, length) =>
  value.toString().length < length ?  padLeft("0" + value, length) : value;
var formatDate = (d) => [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate()
  ].map(x => padLeft(x.toString(), 2)).join('');

module.exports.map = function(file, emit){
  var data = JSON.parse(file.buffer.toString('utf8'));
  emit('ferma', data);
};
module.exports.reduce = function(key, values){
  return _.flatten(values);
};
