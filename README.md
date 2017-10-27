# rdd.js
If you are using spark, you will feel RDD is very convenient to use, this lib will help you to feel good again when you are using js to process data.

```js
// count/forEach/reduce/save* api will return a promise.

const RDD = require('rdd.js');

const rdd = RDD.fromIterable([1, 2, 3, 4, 5]); // create rdd from iterable.

rdd.reduce((m, i) => m + i).then(console.log); // sum of the items.

rdd.count().then(console.log);
rdd.collect().then(console.log);

rdd
  .map(i => [i % 2, i * 2])
  .reduceBy(pair => pair[0], (m, pair) => m + pair[1], 0)
  .forEach(console.log);

// Or use this.
rdd
    .map(i => [i % 2, i * 2]) // map to [key, value] pair or { key: _, value: _ } object. 
    .reduceByKey((m, v) => m + v)
    .forEach(console.log);

rdd.flatMap(i => [i, i + 1])
  .forEach(console.log);

rdd
    .groupBy(i => i % 2)
    .forEach(console.log);

rdd
    .map(i => [i % 2, i * 2])
    .groupByKey()
    .forEach(console.log);

rdd.saveAsTextFile('blabla');
rdd.saveAsJsonFile('blabla');
```

```js
const RDD = require('rdd.js');

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
```
