const LRUIterator = require('./iterator');
const {getStorageKey} = require('./keys');

const propLimit = Symbol();
const propHead = Symbol();
const propTail = Symbol();

class LRU extends Map {
	constructor(limit) {
		if ('number' !== typeof limit || limit <= 0) {
			throw new TypeError('Limit argument should be positive integer');
		}

		super();

		this[propLimit] = limit;
	}

	clear() {
		this[propHead] = undefined;
		this[propTail] = undefined;
		super.clear();
	}

	delete(originalKey) {
		const key = getStorageKey(originalKey);
		const record = super.get(key);
		if (undefined === record) {
			return false;
		}

		const [, previous, next] = record;
		super.delete(key);

		if (key === this[propTail]) {
			this[propTail] = previous;
		}
		if (key === this[propHead]) {
			this[propHead] = next;
		}

		if (undefined !== previous) {
			super.get(previous)[2] = next;
		}

		if (undefined !== next) {
			super.get(next)[1] = previous;
		}

		return true;
	}

	has(key) {
		return super.has(getStorageKey(key));
	}

	get(originalKey) {
		const key = getStorageKey(originalKey);
		const record = super.get(key);
		if (undefined === record) {
			return record;
		}

		if (key !== this[propHead]) {
			const head = super.get(this[propHead]);
			head[1] = key;

			const [, previous, next] = record;
			super.get(previous)[2] = next;
			if (undefined !== next) {
				super.get(next)[1] = previous;
			}

			record[1] = undefined;
			record[2] = this[propHead];

			if (key === this[propTail]) {
				this[propTail] = previous;
			}

			this[propHead] = key;
		}

		return record[0];
	}

	set(originalKey, value) {
		const key = getStorageKey(originalKey);
		let checkSize = false;

		let record = super.get(key);
		if (undefined !== record) {
			if (key !== this[propHead]) {
				const [, previous, next] = record;
				super.get(previous)[2] = next;

				if (undefined !== next) {
					super.get(next)[1] = previous;
				}

				record[2] = this[propHead];

				if (key === this[propTail]) {
					this[propTail] = previous;
				}
			}

			record[1] = undefined;
		} else {
			record = new Array(3);

			super.set(key, record);

			if (undefined === this[propTail]) {
				this[propTail] = key;
			} else {
				checkSize = true;
			}
		}

		record[0] = value;

		if (undefined !== this[propHead] && key !== this[propHead]) {
			record[2] = this[propHead];

			super.get(this[propHead])[1] = key;
		}

		this[propHead] = key;

		if (checkSize && this.size > this[propLimit]) {
			const tail = super.get(this[propTail]);
			const [, previous] = tail;
			super.get(previous)[2] = undefined;
			super.delete(this[propTail]);

			this[propTail] = previous;
		}

		return this;
	}

	forEach(callback, thisArg = this) {
		for (const entry of this) {
			callback.call(thisArg, entry[1], entry[0], this);
		}
	}

	values() {
		return new LRUIterator(key => super.get(key), this[propHead], LRUIterator.Types.Values);
	}

	keys() {
		return new LRUIterator(key => super.get(key), this[propHead], LRUIterator.Types.Keys);
	}

	entries() {
		return new LRUIterator(key => super.get(key), this[propHead], LRUIterator.Types.Entries);
	}

	[Symbol.iterator]() {
		return this.entries()[Symbol.iterator]();
	}

	get limit() {
		return this[propLimit];
	}
}

module.exports = LRU;