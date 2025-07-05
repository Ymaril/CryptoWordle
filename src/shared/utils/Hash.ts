// src/shared/utils/Hash.ts

export default class Hash {
  private readonly value: string;

  constructor(value: string) {
    this.value = value.toLowerCase();
  }

  /**
   * Compares this hash with another hash or string.
   * The comparison is done based on the length of the shorter hash,
   * allowing for partial hash matching.
   * @param another - The hash or string to compare against.
   * @returns True if the hashes match (fully or partially).
   */
  equals(another: Hash | string): boolean {
    const anotherValue =
      another instanceof Hash ? another.toString() : another.toLowerCase();

    if (this.value.length < anotherValue.length) {
      return anotherValue.startsWith(this.value);
    } else {
      return this.value.startsWith(anotherValue);
    }
  }

  /**
   * Returns the full string value of the hash.
   */
  toString(): string {
    return this.value;
  }
}
