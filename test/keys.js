const assert = require('assert');

const {getStorageKey, getRealKey} = require('../src/keys');

describe('Keys hacks', () => {

	[undefined, NaN, 'test', 5, 0, false, {}].forEach(key => {

		it(`Using ${key}`, () => {
			const storageKey = getStorageKey(key);
			const realKey = getRealKey(storageKey);

			if (Number.isNaN(key)) {
				assert(Number.isNaN(realKey));
			} else {
				assert.strictEqual(key, realKey);
			}
		});

	});

});