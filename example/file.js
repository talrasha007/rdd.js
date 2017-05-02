const RDD = require('..');

const rdd = RDD.fromTextFile(`${__dirname}/iterable.js`);

rdd.filter(l => l).forEach(console.log);

const cntRdd = rdd.filter(l => l)
  .map(l => ({ lineWordCount: l.split(/\s+/).length }));

cntRdd.forEach(console.log);

rdd.saveAsTextFile('/tmp/foo.txt');
cntRdd.saveAsJsonFile('/tmp/foo.json').then(() => {
  console.log('===================');
  RDD.fromJsonFile('/tmp/foo.json').forEach(console.log);
});