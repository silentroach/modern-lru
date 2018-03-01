const {getStorageKey, getRealKey} = require('./keys');

const propHead = Symbol('head');
const propTail = Symbol('tail');

/**
 * LRU
 * @property {Number} limit
 */
class LRU extends Map {
	/**
	 * @constructor
	 * @param {Number} limit
	 * @param {Iterable} initial
	 */
	constructor(limit, initial) {
		if ('number' !== typeof limit || limit <= 0) {
			throw new TypeError('Limit argument should be positive integer');
		}

		super();

		Object.defineProperty(this, 'limit', {
			value: limit,
			writable: false
		})

		if (undefined !== initial && null !== initial) {
			if ('function' != typeof initial[Symbol.iterator]) {
				throw new TypeError('Initial argument should be iterable');
			}

			for (const [key, value] of initial) {
				this.set(key, value);
			}
		}
	}

	/**
	 * Remove all key/value pairs
	 */
	clear() {
		this[propHead] = undefined;
		this[propTail] = undefined;
		super.clear();
	}

	/**
	 * Remove any value associated to the key
	 * @param {*} key
	 * @returns {Boolean} true if anything was deleted
	 */
	delete(key) {
		const safeKey = getStorageKey(key);
		const record = super.get(safeKey);
		if (undefined === record) {
			return false;
		}

		const [, previous, next] = record;
		super.delete(safeKey);

		if (safeKey === this[propTail]) {
			this[propTail] = previous;
		}
		if (safeKey === this[propHead]) {
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

	/**
	 * Returns a boolean asserting whether a value has been associated to the key in LRU object or not
	 * @returns {Boolean}
	 */
	has(key) {
		return super.has(getStorageKey(key));
	}

	/**
	 * Returns the value associated to the key or undefined if there is none
	 * @param {*} key
	 * @returns {*}
	 */
	get(key) {
		const safeKey = getStorageKey(key);
		const record = super.get(safeKey);
		if (undefined === record) {
			return record;
		}

		if (safeKey !== this[propHead]) {
			const head = super.get(this[propHead]);
			head[1] = safeKey;

			const [, previous, next] = record;
			super.get(previous)[2] = next;
			if (undefined !== next) {
				super.get(next)[1] = previous;
			}

			record[1] = undefined;
			record[2] = this[propHead];

			if (safeKey === this[propTail]) {
				this[propTail] = previous;
			}

			this[propHead] = safeKey;
		}

		return record[0];
	}

	/**
	 * Sets the value for the key, returns self
	 * @param {*} key
	 * @param {*} value
	 * @returns {LRU}
	 */
	set(key, value) {
		let checkSize = false;
		const safeKey = getStorageKey(key);

		let record = super.get(safeKey);
		if (undefined !== record) {
			if (safeKey !== this[propHead]) {
				const [, previous, next] = record;
				super.get(previous)[2] = next;

				if (undefined !== next) {
					super.get(next)[1] = previous;
				}

				record[2] = this[propHead];

				if (safeKey === this[propTail]) {
					this[propTail] = previous;
				}
			}

			record[1] = undefined;
		} else {
			record = new Array(3);

			super.set(safeKey, record);

			if (undefined === this[propTail]) {
				this[propTail] = safeKey;
			} else {
				checkSize = true;
			}
		}

		record[0] = value;

		if (undefined !== this[propHead] && safeKey !== this[propHead]) {
			record[2] = this[propHead];

			super.get(this[propHead])[1] = safeKey;
		}

		this[propHead] = safeKey;

		if (checkSize && this.size > this.limit) {
			const tail = super.get(this[propTail]);
			const [, previous] = tail;
			super.get(previous)[2] = undefined;
			super.delete(this[propTail]);

			this[propTail] = previous;
		}

		return this;
	}

	/**
	 * Calls callback function once for each key-value pair present in the LRU object, in last usage order
	 * @param {Function} callback Will be called for each key-value pair
	 * @param {*} [thisArg=this] This value for callback function
	 */
	forEach(callback, thisArg = this) {
		for (const [value, key] of this) {
			callback.call(thisArg, value, key, this);
		}
	}

	/**
	 * Returns a new iterator object that contains the values for each element in last usage order
	 * @returns {GeneratorFunction}
	 */
	* values() {
		for (const [key, value] of this) {
			yield value;
		}
	}

	/**
	 * Returns a new iterator object that contains the keys for each element in last usage order
	 * @returns {GeneratorFunction}
	 */
	* keys() {
		for (const [key] of this) {
			yield key;
		}
	}

	/**
	 * Returns a new iterator object that contains an array of [key, value] for each element in last usage order
	 * @returns {GeneratorFunction}
	 */
	* entries() {
		let key = this[propHead];

		while (undefined !== key) {
			const [value, prev, next] = super.get(key);

			yield [getRealKey(key), value];

			key = next;
		}
	}

	get [Symbol.iterator]() {
		return this.entries;
	}
}

module.exports = LRU;