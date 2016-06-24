# LRU cache for node.js

LRU cache implementation on modern javascript.

## Installation

	npm i modern-lru --save

## Usage

	const LRU = require('modern-lru');

	// lru cache with limit of 3 entries
	const cache = new LRU(3);

	cache.set('first', 'first');
	cache.set('second', 'second');
	cache.set('third', 'third');

	console.log(cache.get('second')); // second
	console.log(cache); // LRU { 'second' => 'second', 'third' => 'third', 'first' => 'first' }

	cache.set('fourth', 'fourth'); // will evict "first"

	// also it implements default Map
	console.log(cache instanceof Map); // true

	// so you can use `keys()` for example
	console.log(Array.from(cache.keys()).join(', ')) // 'fourth, second, third'

	console.log(cache.limit); // 3