const assert = require('assert');

const LRU = require('../');

describe('LRU cache', () => {
	describe('constructor', () => {
		it('should throw on no arguments in constructor', () => {
			assert.throws(() => new LRU);
		});

		it('should throw on non-number limit', () => {
			assert.throws(() => new LRU({}));
			assert.throws(() => new LRU([]));
			assert.throws(() => new LRU('test'));
		});

		it('should throw on negative limit', () => {
			assert.throws(() => new LRU(0));
			assert.throws(() => new LRU(-1));
		});
	});

	it('should be instance of both Map and LRU', () => {
		const lru = new LRU(10);
		assert.ok(lru instanceof Map);
		assert.ok(lru instanceof LRU);
	});

	describe('limit', () => {
		it('should return LRU cache limit', () => {
			const limit = 10;
			const lru = new LRU(limit);

			assert.strictEqual(lru.limit, limit);
		});
	});

	describe('Map inheritance expectations', () => {
		it('has/get/set should work as expected', () => {
			const key = 'test';
			const value = 'value';

			const lru = new LRU(1);
			assert.ok(lru.set(key, value) instanceof LRU, 'should return LRU instance on set');
			assert.strictEqual(lru.get('something'), undefined, '`get()` should return undefined if key is not found');
			assert.ok(lru.has(key), '`has()` should indicate whether an element exists');
			assert.strictEqual(lru.get(key), value, '`get()` should return correct value');
		});

		it('object as keys', () => {
			const key = { test : 5 };

			const lru = new LRU(1);
			lru.set(key, 1);

			assert.ok(lru.has(key));
			assert.ok(!lru.has({ test : 5})); // different pointers
		});

		it('`clear()` should clean the map', () => {
			const lru = new LRU(1);
			lru.set('first', 'first');

			assert.strictEqual(lru.size, 1);
			lru.clear();
			assert.strictEqual(lru.size, 0);
			assert.ok(!lru.has('first'));
		});

		it('`delete()` should return if key existed', () => {
			const lru = new LRU(3);
			lru.set('first', 'first');
			lru.set('second', 'second');
			lru.set('third', 'third');

			assert.strictEqual(lru.delete('second'), true);
			assert.strictEqual(lru.delete('something'), false);
		});

		it('`values()` should return values iterator', () => {
			const lru = new LRU(2);
			const keys = ['first', 'second'];
			const reversed = keys.slice(0).reverse();

			keys.forEach(key => lru.set(key, key));

			let count = 0;
			let idx = 0;
			for (const value of lru.values()) {
				++count;
				assert.strictEqual(value, lru.get(reversed[idx++]));
			}

			assert.strictEqual(count, keys.length);
		});

		it('`keys()` should return keys iterator', () => {
			const lru = new LRU(2);
			const keys = ['first', 'second'];
			const reversed = keys.slice(0).reverse();

			keys.forEach(key => lru.set(key, key));

			let count = 0;
			let idx = 0;
			for (const key of lru.keys()) {
				++count;
				assert.strictEqual(key, reversed[idx++]);
			}

			assert.strictEqual(count, keys.length);
			assert.deepEqual(Array.from(lru.keys()), reversed);
		});

		function entriesTest(name, iterator) {
			it(name, () => {
				const lru = new LRU(2);
				const keys = ['first', 'second'];
				const reversed = keys.slice(0).reverse();

				keys.forEach(key => lru.set(key, key));

				let count = 0;
				let idx = 0;
				for (const entry of iterator(lru)) {
					const key = reversed[idx++];
					++count;
					assert.deepEqual(entry, [key, lru.get(key)]);
				}

				assert.strictEqual(count, keys.length);
			});
		}

		entriesTest(
			'`entries()` should return entries iterator',
			lru => lru.entries()
		);

		entriesTest(
			'`@@iterator` should return entries iterator',
			lru => lru
		);

		it('`forEach()` should call callback for each element', () => {
			const keys = ['first', 'second', 'third'];
			const reversed = keys.slice(0).reverse();

			const lru = new LRU(3);
			keys.forEach(key => lru.set(key, key));

			let idx = 0;
			lru.forEach((key, value, lru) => {
				const k = reversed[idx++];
				assert.strictEqual(key, k);
				assert.strictEqual(value, lru.get(k));
				assert.ok(lru instanceof LRU);
			});
		});
	});

	describe('eviction', () => {
		it('should evict old values', () => {
			const lru = new LRU(1);

			lru.set('first', 'first');
			lru.set('second', 'second');

			assert.strictEqual(lru.size, 1);
			assert.ok(!lru.has('first'));
		});

		it('should not evict keys read recently', () => {
			const lru = new LRU(3);

			lru.set('first', 'first');
			lru.set('second', 'second');
			lru.set('third', 'third'); // the most recent

			// should make "second" the most recent, then third and then first
			assert.strictEqual(lru.get('second'), 'second');
			lru.set('something', 'something');

			assert.strictEqual(lru.size, 3);
			assert.ok(!lru.has('first'), 'first key should be evicted');
			assert.ok(lru.has('second'), 'second should not be evicted');
		});

		it('should work fine on double set', () => {
			const lru = new LRU(3);

			lru.set('first', 'first');
			lru.set('second', 'second');
			lru.set('third', 'third');
			lru.set('second', 'ha!');  // the most recent now, will restruct nearest

			assert.deepEqual(Array.from(lru.keys()), ['second', 'third', 'first']);
		})
	});

	describe('delete', () => {
		it('should return false on no record deleted', () => {
			const lru = new LRU(1);
			lru.set('test', 'value');

			assert.ok(!lru.delete('random'));
		});

		it('should work fine if head is removed', () => {
			const lru = new LRU(2);

			lru.set('first', 'first');
			lru.set('second', 'second'); // head now

			lru.delete('second');

			assert.ok(lru.has('first'));
			assert.ok(!lru.has('second'));

			// first is now at head and tail
			lru.set('second', 'second'); // second is head, first is tail
			lru.set('third', 'third'); // first should be evicted

			assert.ok(!lru.has('first'));
			assert.ok(lru.has('second'));
			assert.ok(lru.has('third'));
		});

		it('should work fine if tail is removed', () => {
			const lru = new LRU(2);

			lru.set('first', 'first');
			lru.set('second', 'second'); // first is tail now

			lru.delete('first');

			assert.ok(lru.has('second'));
			assert.ok(!lru.has('first'));

			// second is now head and tail
			lru.set('first', 'first'); // first is head, second is tail
			lru.set('third', 'third'); // second should be evicted

			assert.ok(!lru.has('second'));
			assert.ok(lru.has('first'));
			assert.ok(lru.has('third'));
		});
	});
});
