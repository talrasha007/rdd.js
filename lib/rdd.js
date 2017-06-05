const fs = require('fs');
const cs = require('co-stream');
const glob = require('glob');
const MultiStream = require('multistream');

const getKey = item => item instanceof Array ? item[0] : item.key;
const getValue = item => item instanceof Array ? item[1] : (item.value || item.val);

function pathToStream(path) {
  if (path instanceof Array) {
    const streams = path
      .filter(p => fs.statSync(p).isFile())
      .map(p => fs.createReadStream(p));

    if (streams.length === 0) {
      throw new Error('No file matched for path: [' + path.join(',') + ']');
    } else {
      return streams.length === 1 ? streams[0] : MultiStream(streams);
    }
  } else {
    return pathToStream(glob.sync(path));
  }
}

class RDD {
  static fromIterable(iterable) {
    return new RDD(() => cs.fromIterable(iterable));
  }

  static fromTextFile(path) {
    return new RDD(() => pathToStream(path).pipe(cs.split()));
  }

  static fromJsonFile(path) {
    return new RDD(() =>
      pathToStream(path)
        .pipe(cs.split())
        .pipe(cs.object.map(line => JSON.parse(line)))
    );
  }

  constructor(fnGetStream) {
    this._ops = [];
    this._fnGetStream = fnGetStream;
  }

  map(mapFn) {
    return this._push(() => cs.object.map(mapFn));
  }

  flatMap(mapFn) {
    return this._push(() => cs.object.flatMap(mapFn));
  }

  filter(filterFn) {
    return this._push(() => cs.object.filter(filterFn));
  }

  reduce(reduceFn, initVal) {
    let first = true;
    let m = initVal;

    const stream = cs.object.each(item => {
      if (first && (initVal === undefined || initVal === null)) {
        first = false;
        m = item;
      } else {
        m = reduceFn(m, item);
      }
    });

    this._opsToStream().pipe(stream);
    return this._streamToPromise(stream, () => m);
  }

  count() {
    return this.reduce(m => m + 1, 0);
  }

  collect() {
    return this.reduce((m, i) => {
      m.push(i);
      return m;
    }, []);
  }

  forEach(fn) {
    const stream = cs.object.each(fn);
    this._opsToStream().pipe(stream);
    return this._streamToPromise(stream, () => {});
  }

  saveAsTextFile(path) {
    const writer = fs.createWriteStream(path);
    this._opsToStream()
      .pipe(cs.object.map(item => item.toString() + '\n'))
      .pipe(writer);

    return this._streamToPromise(writer, () => {});
  }

  saveAsJsonFile(path) {
    const writer = fs.createWriteStream(path);
    this._opsToStream()
      .pipe(cs.object.map(item => JSON.stringify(item) + '\n'))
      .pipe(writer);

    return this._streamToPromise(writer, () => {});
  }

  reduceBy(keyFn, reduceFn, initVal, valueFn) {
    const map = new Map();

    const stream = cs.object.each(item => {
      const key = keyFn(item);
      const value = valueFn ? valueFn(item) : item;

      if (map.has(key)) {
        const m = map.get(key);
        map.set(key, reduceFn(m, value));
      } else {
        const val = initVal !== undefined && initVal !== null ? reduceFn(initVal, value) : value;
        map.set(key, val);
      }
    });

    this._opsToStream().pipe(stream);
    return RDD.fromIterable(this._streamToPromise(stream, () => map));
  }

  groupBy(keyFn) {
    return this.reduceBy(keyFn, (m, item) => m.concat([item]), []);
  }

  reduceByKey(reduceFn, initVal) {
    return this.reduceBy(getKey, reduceFn, initVal, getValue);
  }

  groupByKey() {
    return this.reduceByKey((m, v) => m.concat([v]), []);
  }

  _streamToPromise(stream, valueGetter) {
    return new Promise((resolve, reject) => {
      stream.on('end', () => resolve(valueGetter()));
      stream.on('finish', () => resolve(valueGetter()));
      stream.on('error', err => reject(err));
    });
  }

  _push(op) {
    const ret = new RDD(this._fnGetStream);
    ret._ops = [].concat(this._ops, [op]);
    return ret;
  }

  _opsToStream() {
    let stream = this._fnGetStream();
    for (let op of this._ops) {
      stream = stream.pipe(op());
    }

    return stream;
  }
}

module.exports = RDD;