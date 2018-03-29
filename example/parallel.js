const _ = require('co-lodash');
const RDD = require('..');

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
