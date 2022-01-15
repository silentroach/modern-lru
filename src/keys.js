const KeyMap = new Map([
  [undefined, Symbol()],
  [NaN, Symbol()],
]);

const KeyMapReversed = new Map(
  Array.from(KeyMap.keys()).map((key) => {
    return [KeyMap.get(key), key];
  })
);

/**
 * @returns {Symbol} symbol only, no reason to check with .has
 */
exports.getStorageKey = (key) => KeyMap.get(key) || key;

/**
 * @returns {undefined|NaN|*}
 */
exports.getRealKey = (key) =>
  KeyMapReversed.has(key) ? KeyMapReversed.get(key) : key;
