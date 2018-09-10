# rdd.js
If you are using spark, you will feel RDD is very convenient to use, this lib will help you to feel good again when you are using js to process data.

```js
// parallel execution for async call.
const _ = require('co-lodash');
const RDD = require('rdd.js');

(async function () {
  function *iterator() {
    for (let i = 0; i < 64; i++) yield i;
  }

  const rdd = RDD.fromIterable(iterator());
  rdd
    .parallel(4)
    .forEach(async i => {
      await _.sleep(Math.random() * 1000);
      console.log(i);
    });
})().catch(e => console.log(e.stack));
```

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
  const csvRdd = RDD.fromCsvFile(`${os.tmpdir()}/foo.csv`);
  await csvRdd.forEach(console.log);

  await csvRdd.saveAsJsonFile(`${os.tmpdir()}/test.json`);
  console.log('=========test.json=========');
  await RDD.fromJsonFile(`${os.tmpdir()}/test.json`).forEach(console.log);

  console.log('==========specify header==========');
  await csvRdd.saveAsCsvFile(`${os.tmpdir()}/test.csv`, { header: false });
  await RDD
    .fromCsvFile(`${os.tmpdir()}/test.csv`, { columns: ['wcnt', 'lf'] })
    .forEach(console.log);
})().catch(e => console.log(e.stack));
```
