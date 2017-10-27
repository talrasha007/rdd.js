const RDD = require('..');
const os = require('os');

(async function () {
  const rdd = RDD.fromTextFile(`${__dirname}/iterable.js`);

  rdd.filter(l => l).forEach(console.log);

  const cntRdd = rdd.filter(l => l)
    .map(l => ({ lineWordCount: l.split(/\s+/).length, isLongStatement: l.split(/\s+/).length > 10 }));

  cntRdd.forEach(console.log);

  rdd.saveAsTextFile(`${os.tmpdir()}/foo.txt`);
  cntRdd.saveAsJsonFile(`${os.tmpdir()}/foo.json`).then(() => {
    console.log('==========foo.json==========');
    RDD.fromJsonFile(`${os.tmpdir()}/foo.json`).forEach(console.log);
  });

  cntRdd.saveAsCsvFile(`${os.tmpdir()}/foo.csv`);

  // test for csv file
  const csvRdd = RDD.fromCsvFile(`${os.tmpdir()}/foo.csv`);
  await csvRdd.forEach(console.log);

  csvRdd.saveAsJsonFile(`${os.tmpdir()}/test.json`).then(() => {
    console.log('=========test.json=========');
    RDD.fromJsonFile(`${os.tmpdir()}/test.json`).forEach(console.log);
  });

  csvRdd.saveAsCsvFile(`${os.tmpdir()}/test.csv`);

})().catch(e => console.log(e.stack));