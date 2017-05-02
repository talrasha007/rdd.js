# rdd.js
If you are using spark, you will feel RDD is very convenient to use, this lib will help you to feel good again when you are using js to process data.

```js
const RDD = require('rdd.js');

const rdd = RDD.fromIterable([1, 2, 3, 4, 5]); // create rdd from iterable.

rdd.reduce((m, i) => m + i).then(console.log); // sum of the items.

rdd
  .map(i => [i % 2, i * 2])
  .reduceBy(pair => pair[0], (m, pair) => m + pair[1], 0)
  .forEach(console.log);

rdd.saveAsTextFile('blabla');
rdd.saveAsJsonFile('blabla');
```

```js
const RDD = require('rdd.js');

const rdd = RDD.fromTextFile(`${__dirname}/iterable.js`);
rdd.filter(l => l).forEach(console.log); // non-empty line

RDD.fromJsonFile('/tmp/foo.json').forEach(console.log); // Read from json file.
```