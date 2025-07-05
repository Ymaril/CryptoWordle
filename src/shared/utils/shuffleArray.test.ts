import { describe, it, expect } from "vitest";
import shuffleArray from "./shuffleArray";

describe("shuffleArray", () => {
  it("should return an array of the same length", () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...original]);
    expect(shuffled).toHaveLength(original.length);
  });

  it("should contain the same elements", () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...original]);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it("should produce a different order for a sufficiently large array", () => {
    const original = Array.from({ length: 50 }, (_, i) => i);
    const shuffled = shuffleArray([...original]);
    // This test could theoretically fail by chance, but it's extremely unlikely.
    expect(shuffled).not.toEqual(original);
  });

  it("should handle an empty array", () => {
    const original: any[] = [];
    const shuffled = shuffleArray([...original]);
    expect(shuffled).toEqual([]);
  });

  it("should handle an array with one element", () => {
    const original = [1];
    const shuffled = shuffleArray([...original]);
    expect(shuffled).toEqual([1]);
  });
});
