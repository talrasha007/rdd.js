const fs = require('fs');
const cs = require('co-stream');

class RDD {
  static fromIterable(iterable) {
    return new RDD(() => cs.fromIterable(iterable));
  }

  static fromTextFile(path) {
    return new RDD(() => fs.createReadStream(path).pipe(cs.split()));
  }

  static fromJsonFile(path) {
    return new RDD(() =>
      fs.createReadStream(path)
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

  reduceBy(keyFn, reduceFn, initVal) {
    const map = new Map();

    const stream = cs.object.each(item => {
      const key = keyFn(item);
      if (map.has(key)) {
        const m = map.get(key);
        map.set(key, reduceFn(m, item));
      } else {
        const val = initVal !== undefined && initVal !== null ? reduceFn(initVal, item) : item;
        map.set(key, val);
      }
    });

    this._opsToStream().pipe(stream);
    return RDD.fromIterable(this._streamToPromise(stream, () => map));
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