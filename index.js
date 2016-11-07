const IteratorTypes = {
	Keys: 0,
	Values: 1,
	Entries: 2
};

const propGetter = Symbol('propGetter');
const propStart = Symbol('propStart');
const propType = Symbol('propType');

const undefinedKey = Symbol();

class LRUIterator {
	constructor(getter, start, type) {
		this[propGetter] = getter;
		this[propStart] = start;
		this[propType] = type;
	}

	[Symbol.iterator]() {
		let key = this[propStart];

		return {
			next: () => {
				if (undefined !== key) {
					const record = this[propGetter](key);
					let value;

					if (key === undefinedKey) {
						key = undefined;
					}

					switch (this[propType]) {
						case IteratorTypes.Keys:
							value = key;
							break;
						case IteratorTypes.Values:
							value = record[0];
							break;
						case IteratorTypes.Entries:
							value = [key, record[0]];
							break;
					}

					key = record[2];

					return {
						value,
						done: false
					};
				} else {
					return { done: true };
				}
			}
		};
	}
}

const propLimit = Symbol('propLimit');
const propHead = Symbol('propHead');
const propTail = Symbol('propTail');

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
		const key = undefined === originalKey ? undefinedKey : originalKey;
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
		return super.has(
			undefined === key ? undefinedKey : key
		);
	}

	get(originalKey) {
		const key = undefined === originalKey ? undefinedKey : originalKey;

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
		const key = undefined === originalKey ? undefinedKey : originalKey;
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
		record[1] = undefined;

		if (key !== this[propHead] && undefined !== this[propHead]) {
			record[2] = this[propHead];

			const head = super.get(this[propHead]);
			head[1] = key;
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

	forEach(callback, thisArgument) {
		for (const entry of this) {
			callback.call(thisArgument || this, entry[1], entry[0], this);
		}
	}

	values() {
		return new LRUIterator(key => super.get(key), this[propHead], IteratorTypes.Values);
	}

	keys() {
		return new LRUIterator(key => super.get(key), this[propHead], IteratorTypes.Keys);
	}

	entries() {
		return new LRUIterator(key => super.get(key), this[propHead], IteratorTypes.Entries);
	}

	[Symbol.iterator]() {
		return this.entries()[Symbol.iterator]();
	}

	get limit() {
		return this[propLimit];
	}
}

module.exports = LRU;
