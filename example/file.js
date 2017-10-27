const RDD = require('..');

(async function () {
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

  // test for csv file
  const csvRdd = RDD
    .fromCsvFile('./file/input.csv');

  await csvRdd.forEach(console.log);
  csvRdd.saveAsJsonFile('./file/test.json').then(() => {
    console.log('===================');
    RDD.fromJsonFile('./file/test.json').forEach(console.log);
  })

  csvRdd.saveAsCsvFile('./file/test.csv');

})().catch(e => console.log(e.stack));