'use strict';

var I = 0;
var N = 100;

var data = require('./data');

function update(dbs) {
  for (var i = 0; i < dbs.length; i++) {
    dbs[i].update();
  }
}

function formatElapsed(v) {
  if (!v) return '';

  var str = parseFloat(v).toFixed(2);

  if (v > 60) {
    var minutes = Math.floor(v / 60);
    var comps = (v % 60).toFixed(2).split('.');
    var seconds = comps[0];
    var ms = comps[1];
    str = minutes + ":" + seconds + "." + ms;
  }

  return str;
}

function labelClass(count) {
  if (count >= 20) {
    return 'label label-important';
  } else if (count >= 10) {
    return 'label label-warning';
  }
  return 'label label-success';
}

function elapsedClass(t) {
  if (t >= 10.0) {
    return 'Query elapsed warn_long';
  } else if (t >= 1.0) {
    return 'Query elapsed warn';
  }
  return 'Query elapsed short';
}

document.addEventListener('DOMContentLoaded', function() {
  main();
});

function text(x){return x ? x.replace(/</g,'&lt;').replace(/>/g,'&gt;'): ' ';}

function build(dbs) {
  var ret = [];
  for (var i = 0; i < dbs.length; i++) {
    var db = dbs[i];
    var top5 = db.getTopFiveQueries();
    var count = db.queries.length;
    for (var j = 0; j < 5; j++) {
      var q = top5[j];
      q.elapsedClass = elapsedClass(q.elapsed);
      q.formatElapsed = formatElapsed(q.elapsed);
      q.text = text(q.query);
    }
    ret.push({id: db.id, name: text(db.name), count: count, labelClass: labelClass(count), top5: top5});
  }
  return {dbs: ret};
}

function main() {
  var dbs = [];
  for (var i = 0; i < N; i++) {
    dbs.push(new data.Database('cluster' + i));
    dbs.push(new data.Database('cluster' + i + 'slave'));
  }

  // setInterval(function() {
  //   update(dbs);
  // }, I);

  var template = document.getElementById('main').innerHTML;
  var render = doTA.compile(template, {debug:0, encode:1, keepDom: 1, watchDiff:1});

  document.body.innerHTML = render(build(dbs));

  function domUpdate() {
    update(dbs);
    render(build(dbs), null, null, true);
  }
  setInterval(domUpdate, 0)

}
