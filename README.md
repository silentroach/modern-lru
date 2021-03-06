# LRU cache for node.js

[![npm](https://img.shields.io/npm/v/modern-lru.svg?style=flat-square)](https://www.npmjs.com/package/modern-lru)
[![Travis](https://img.shields.io/travis/silentroach/modern-lru.svg?style=flat-square&label=travis)](https://travis-ci.org/silentroach/modern-lru)
[![Coverage](https://img.shields.io/coveralls/silentroach/modern-lru.svg?style=flat-square&label=coverage)](https://coveralls.io/github/silentroach/modern-lru)

Simple O(1) LRU cache implementation based on native `Map` class.

## Installation

	npm i modern-lru --save

## API

`LRU` cache class is based on native `Map` so API is **the same**. Also you can safely use **anything** for keys, for example `undefined`, `NaN` or some object pointer.

### Constructor

`new LRU(limit[, iterable])`

`limit` - cache keys limit, positive integer.

`iterable` - optional `Array` or other `iterable` object whose elements are key-value pairs (arrays with two elements, e.g. `[[ 1, 'one' ],[ 2, 'two' ]]`). Each key-value pair is added to the new `LRU` instance.

### Properties

`.size`

The number of keys currently in the cache.

`.limit`

Cache keys limit in current instance

### Methods

`.clear()`

Removes all key/value pairs from the `LRU` object.

`.delete(key)`

Removes any value associated to the `key` and returns the value that `.has(key)` would have previously returned. `.has(key)` will return `false` afterwards.

`.entries()`

Returns a new `Iterator` object that contains **an array of [key, value]** for each element in the LRU object in last usage order.

`.forEach(callbackFn[, thisArg])`

Calls `callbackFn` once for each key-value pair present in the `LRU` object, in last usage order. If a `thisArg` parameter is provided to `forEach`, it will be used as the this value for each callback.

`.get(key)`

Returns the value associated to the `key`, or `undefined` if there is none.

`.has(key)`

Returns a boolean asserting whether a value has been associated to the `key` in the `LRU` object or not.

`.keys()`

Returns a new `Iterator` object thet contains the **keys** for each element in the `LRU` object in last usage order.

`.set(key, value)`

Sets the value for the `key` in the `LRU` object. Returns the `LRU` object.

`.values()`

Returns a new `Iterator` object that contains the **values** for each element in the `LRU` object in last usage order.

`[@@iterator]()`

Returns a new `Iterator` object that contains **an array of [key, value]** for each element in the `LRU` object in last usage order.

## Example

```js
const LRU = require('./');

// lru cache with limit of 3 entries
const cache = new LRU(3);

console.log(cache.limit); // 3
console.log(cache.size); // 0 (elements count)

cache.set('first', 'first');
cache.set('second', 'second');
cache.set('third', 'third');

console.log(cache.get('second')); // second
console.log(cache); // LRU { 'second' => 'second', 'third' => 'third', 'first' => 'first' }

cache.set('fourth', 'fourth');
console.log(cache.has('first')); // false ("first" was evicted)
console.log(cache.get('fourth')); // fourth

// also it implements default Map
console.log(cache instanceof Map); // true

// so you can use `keys()` for example
console.log(Array.from(cache.keys()).join(', ')); // 'fourth, second, third'

// or use objects, as with Map
const myObject = { test: 5 };
cache.set(myObject, 'testme');
console.log(cache.has(myObject)); // true
console.log(cache.get(myObject)); // 'testme'
console.log(cache.get({ test: 5})); // undefined (different pointer)

cache.clear();

// also `undefined` and `NaN` are supported, as with Map
cache.set(undefined, 5);
cache.set(NaN, 10);
console.log(cache); // LRU { NaN => 10, undefined => 5 }
```

## Alternatives

[lru-fast](https://github.com/rsms/js-lru) - classic doubly-linked list based lru, superfast and memory efficient.

[quick-lru](https://github.com/sindresorhus/quick-lru) - a little bit dirty with broken keys order, but supersimple and fast alternative, inspired by the [hashlru](https://github.com/dominictarr/hashlru) [algorithm](https://github.com/dominictarr/hashlru#algorithm).

Also [some benchmarks here](https://github.com/dominictarr/bench-lru) with more packages, but with no feature comparison.
