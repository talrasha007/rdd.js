const fs = require('fs');
const cs = require('co-stream');

class RDD {
  static fromIterable(iterable) {
    return new RDD(() => cs.fromIterable(iterable));
  }

  constructor(fnGetStream) {
    this._ops = [];
    this._fnGetStream = fnGetStream;
  }

  map(mapFn) {
    this._ops.push(() => cs.object.map(mapFn));
    return this;
  }

  filter(filterFn) {
    this._ops.push(() => cs.object.filter(filterFn));
    return this;
  }

  reduce(reduceFn, initVal) {
    const stream = this._opsToStream();

    let first = true;
    let m = initVal;

    stream.pipe(cs.object.each(item => {
      if (first && (initVal === undefined || initVal === null)) {
        first = false;
        m = item;
      } else {
        m = reduceFn(m, item);
      }
    }));

    return new Promise((resolve, reject) => {
      stream.on('end', () => resolve(m));
      stream.on('error', err => reject(err));
    });
  }

  forEach(fn) {
    this._opsToStream().pipe(cs.object.each(fn));
  }

  reduceBy(keyFn, reduceFn, initVal) {
    const stream = this._opsToStream();
    const map = new Map();

    stream.pipe(cs.object.each(item => {
      const key = keyFn(item);
      if (map.has(key)) {
        const m = map.get(key);
        map.set(key, reduceFn(m, item));
      } else {
        const val = initVal !== undefined && initVal !== null ? reduceFn(initVal, item) : item;
        map.set(key, val);
      }
    }));

    return RDD.fromIterable(new Promise((resolve, reject) => {
      stream.on('end', () => resolve(map));
      stream.on('error', err => reject(err));
    }));
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