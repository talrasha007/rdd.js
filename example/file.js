const RDD = require('..');
const os = require('os');

(async function () {
  const rdd = RDD.fromTextFile(`${__dirname}/iterable.js`);
  const cntRdd = rdd.filter(l => l)
    .map(l => ({
      lineWordCount: l.split(/\s+/).length,
      isLongStatement: l.split(/\s+/).length > 10
    }));

  console.log(`==========${__dirname}/iterable.js==========`);
  await rdd.filter(l => l).forEach(console.log);

  console.log(`==========count rdd origin content==========`);
  await cntRdd.forEach(console.log);

  rdd.saveAsTextFile(`${os.tmpdir()}/foo.txt`);
  await cntRdd.saveAsJsonFile(`${os.tmpdir()}/foo.json`);

  console.log('==========foo.json==========');
  await RDD.fromJsonFile(`${os.tmpdir()}/foo.json`).forEach(console.log);

  await cntRdd.saveAsCsvFile(`${os.tmpdir()}/foo.csv`);

  console.log(`==========foo.csv==========`);
  const csvRdd = RDD.fromCsvFile(`${os.tmpdir()}/foo.csv`, { columns: true });
  await csvRdd.forEach(console.log);

  await csvRdd.saveAsJsonFile(`${os.tmpdir()}/test.json`);
  console.log('=========test.json=========');
  await RDD.fromJsonFile(`${os.tmpdir()}/test.json`).forEach(console.log);

  csvRdd.saveAsCsvFile(`${os.tmpdir()}/test.csv`);

})().catch(e => console.log(e.stack));