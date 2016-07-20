const IteratorTypes = {
	Keys: 0,
	Values: 1,
	Entries: 2
};

const propGetter = Symbol();
const propStart = Symbol();
const propType = Symbol();

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
				if (key) {
					const record = this[propGetter](key);
					let value;

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
				} else return { done: true };
			}
		}
	}
}

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

	delete(key) {
		const record = super.get(key);
		if (undefined === record) {
			return false;
		}

		const [, previous, next] = record;
		super.delete(key);

		if (key === this[propTail]) {
			this[propTail] = previous;
		} else
		if (key === this[propHead]) {
			this[propHead] = next;
		}

		if (previous) {
			super.get(previous)[2] = next;
		}

		if (next) {
			super.get(next)[1] = previous;
		}

		return true;
	}

	get(key) {
		const record = super.get(key);
		if (undefined === record) {
			return record;
		}

		if (key !== this[propHead]) {
			const head = super.get(this[propHead]);
			head[1] = key;

			const [, previous, next] = record;
			super.get(previous)[2] = next;
			if (next) {
				super.get(next)[1] = previous;
			}

			record[1] = undefined;
			record[2] = this[propHead];

			if (key === this[propTail]) {
				this[propTail] = record[2];
			}

			this[propHead] = key;
		}

		return record[0];
	}

	set(key, value) {
		let checkSize = false;

		const oldRecord = super.get(key);
		if (undefined !== oldRecord) {
			const [, previous, next] = oldRecord;
			if (undefined !== previous) {
				super.get(previous)[2] = next;
			}
			if (undefined !== next) {
				super.get(next)[1] = previous;
			}

			oldRecord[0] = value;
			oldRecord[2] = this[propHead];
		} else {
			const record = new Array(3);
			record[0] = value;
			record[1] = undefined;
			record[2] = this[propHead];

			super.set(key, record);

			if (undefined === this[propTail]) {
				this[propTail] = key;
			} else checkSize = true;
		}

		if (this[propHead]) {
			const head = super.get(this[propHead]);
			head[1] = key;
		}

		this[propHead] = key;

		if (checkSize) {
			const tail = super.get(this[propTail]);
			if (undefined === tail[1]) {
				tail[1] = key;
			}

			if (this.size > this[propLimit]) {
				const [, previous] = tail;
				super.get(previous)[2] = undefined;
				super.delete(this[propTail]);
				this[propTail] = previous;
			}
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