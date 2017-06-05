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

const rdd = RDD.fromTextFile(`${__dirname}/iterable.js`);
// Path can use wildcard. eg. '/tmp/*.txt'
rdd.filter(l => l).forEach(console.log); // non-empty line

RDD.fromJsonFile('/tmp/foo.json').forEach(console.log); // Read from json file.
```