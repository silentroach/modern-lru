const KeyMap = new Map([
	[undefined, Symbol()],
	[NaN, Symbol()]
]);

const KeyMapReversed = new Map(
	Array.from(KeyMap.keys()).map(key => {
		return [KeyMap.get(key), key]
	})
);

exports.getStorageKey = key => KeyMap.get(key) || key;

exports.getRealKey = key => KeyMapReversed.has(key) ? KeyMapReversed.get(key) : key;