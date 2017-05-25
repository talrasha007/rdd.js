const RDD = require('..');

(async function () {
  const rdd = RDD.fromIterable([1, 2, 3, 4, 5]);

  await rdd.reduce((m, i) => m + i).then(console.log);

  await rdd
    .map(i => [i % 2, i * 2])
    .reduceBy(pair => pair[0], (m, pair) => m + pair[1], 0)
    .forEach(console.log);

  await rdd
    .map(i => [i % 2, i * 2])
    .reduceByKey((m, v) => m + v)
    .forEach(console.log);

  await rdd
    .groupBy(i => i % 2)
    .forEach(console.log);

  await rdd
    .map(i => [i % 2, i * 2])
    .groupByKey()
    .forEach(console.log);

  console.log(await rdd.count());
  console.log(await rdd.collect());
})().catch(e => console.log(e.stack));
