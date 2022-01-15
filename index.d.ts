export default class ModernLRU<K, V> extends Map<K, V> {
  /**
   * Cache keys limit in current instance
   */
  public readonly limit: number;

  constructor(limit: number, initial?: ReadonlyArray<[K, V]> | null);
}
