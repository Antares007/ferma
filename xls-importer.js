var xlsx = require('xlsjs');

module.exports = function(data){
  var workbook = xlsx.read(data, {type: 'binary'});
  var formatCell = function(cell){
    if(cell){
      if(typeof cell.v === 'number' && looksLikeDate(cell.w)){
        return getDate(cell.v);
      }
      return cell.v;
    }
    return cell;
  };
  return workbook.SheetNames.map(function(sheet){
    return {
      sheet: sheet,
      rows: function(){
        return sheet_to_array_of_array(workbook.Sheets[sheet], formatCell);
      }
    };
  });
};

function getDate(excelDateValue){
  return new Date(Math.round((excelDateValue - 25569) * 60 * 60 * 24 * 1000));
}

function looksLikeDate(v){
  if(typeof v !== 'string'){
    return false;
  }
  var dot = 0;
  for(var i=0,len=v.length;i<len;i++){
    var chr = v[i];
    if(chr === '.') { dot++; }
    if(dot > 1 || chr === '/' || chr === ':' ){
      return true;
    }
  }
  return false;
}

function sheet_to_array_of_array(sheet, formatVlue) {
  var out = [];
  var r = safe_decode_range(sheet['!ref']);
  var row = [],  cols = [];
  var R = 0, C = 0;
  for(C = r.s.c; C <= r.e.c; ++C){
    cols[C] = xlsx.utils.encode_col(C);
  }
  for(R = r.s.r; R <= r.e.r; ++R) {
    row = [];
    for(C = r.s.c; C <= r.e.c; ++C) {
      row.push(formatVlue(sheet[cols[C] + xlsx.utils.encode_row(R)]));
    }
    out.push(row);
  }
  return out;
}

function safe_decode_range(range) {
  var o = {s:{c:0,r:0},e:{c:0,r:0}};
  var idx = 0, i = 0, cc = 0;
  var len = range.length;
  for(idx = 0; i < len; ++i) {
    if((cc=range.charCodeAt(i)-64) < 1 || cc > 26) {break;}
    idx = 26*idx + cc;
  }
  o.s.c = --idx;

  for(idx = 0; i < len; ++i) {
    if((cc=range.charCodeAt(i)-48) < 0 || cc > 9) {break;}
    idx = 10*idx + cc;
  }
  o.s.r = --idx;

  if(i === len || range.charCodeAt(++i) === 58) { o.e.c=o.s.c; o.e.r=o.s.r; return o; }

  for(idx = 0; i !== len; ++i) {
    if((cc=range.charCodeAt(i)-64) < 1 || cc > 26) {break;}
    idx = 26*idx + cc;
  }
  o.e.c = --idx;

  for(idx = 0; i !== len; ++i) {
    if((cc=range.charCodeAt(i)-48) < 0 || cc > 9) {break;}
    idx = 10*idx + cc;
  }
  o.e.r = --idx;
  return o;
}
