# LRU cache for node.js

[![npm](https://img.shields.io/npm/v/modern-lru.svg?style=flat-square)](https://www.npmjs.com/package/modern-lru)
[![Travis](https://img.shields.io/travis/silentroach/modern-lru.svg?style=flat-square&label=travis)](https://travis-ci.org/silentroach/modern-lru)
[![Coverage](https://img.shields.io/coveralls/silentroach/modern-lru.svg?style=flat-square&label=coverage)](https://coveralls.io/github/silentroach/modern-lru)

Simple LRU cache implementation on modern javascript based on native `Map` class.

## Installation

	npm i modern-lru --save

## Usage

```js
const LRU = require('modern-lru');

// lru cache with limit of 3 entries
const cache = new LRU(3);

console.log(cache.limit); // 3
console.log(cache.size); // 0 (elements count)

cache.set('first', 'first');
cache.set('second', 'second');
cache.set('third', 'third');

console.log(cache.get('second')); // second
console.log(cache); // LRU { 'second' => 'second', 'third' => 'third', 'first' => 'first' }

cache.set('fourth', 'fourth'); // will evict "first"
console.log(cache.has('first')); // false
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
```