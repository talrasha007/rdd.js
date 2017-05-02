const RDD = require('..');

const rdd = RDD.fromTextFile(`${__dirname}/iterable.js`);

rdd.filter(l => l).forEach(console.log);

rdd.filter(l => l)
  .map(l => ({ lineWordCount: l.split(/\s+/).length }))
  .forEach(console.log);