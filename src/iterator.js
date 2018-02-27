const {getRealKey} = require('./keys');

const propGetter = Symbol();
const propStart = Symbol();
const propType = Symbol();

const Types = {
	Keys: 0,
	Values: 1,
	Entries: 2
}

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
				if (undefined === key) {
					return { done: true };
				}

				const record = this[propGetter](key);
				let value;

				key = getRealKey(key);

				switch (this[propType]) {
					case Types.Keys:
						value = key;
						break;
					case Types.Values:
						value = record[0];
						break;
					case Types.Entries:
						value = [key, record[0]];
						break;
				}

				key = record[2];

				return {
					value,
					done: false
				};
			}
		};
	}
}

LRUIterator.Types = Types;

module.exports = LRUIterator;