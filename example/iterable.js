const RDD = require('..');

const rdd = RDD.fromIterable([1, 2, 3, 4, 5]);

rdd.reduce((m, i) => m + i).then(console.log);

rdd
  .map(i => [i % 2, i * 2])
  .reduceBy(pair => pair[0], (m, pair) => m + pair[1], 0)
  .forEach(console.log);