import { describe, it, expect } from "vitest";
import { lastValueFrom } from "rxjs";
import YellowCollection from "./YellowCollection";
import { Letter } from "@/entities/letter";
import Hash from "@/shared/utils/Hash";

describe("YellowCollection", () => {
  const testSalt = "test-salt";
  const testIterations = 10; // Low iterations for speed

  it("YellowCollection.create$ should generate a valid YellowCollection object", async () => {
    const letters = [
      new Letter("A", 0),
      new Letter("B", 1),
      new Letter("C", 2),
    ];
    const { progress, result } = await lastValueFrom(
      YellowCollection.create$(letters, testSalt, testIterations)
    );

    expect(progress).toBe(1);
    expect(result).toBeInstanceOf(YellowCollection);
    expect(result?.hashes).toHaveLength(letters.length);
    expect(result?.salt).toBe(testSalt);
    expect(result?.iterations).toBe(testIterations);
  });

  it("YellowCollection.create$ should handle unique and duplicate letters, adding fake hashes", async () => {
    const letters = [
      new Letter("L", 0),
      new Letter("E", 1),
      new Letter("V", 2),
      new Letter("E", 3),
      new Letter("L", 4),
    ]; // LEVEL - L and E are duplicates

    const { progress, result } = await lastValueFrom(
      YellowCollection.create$(letters, testSalt, testIterations)
    );

    expect(progress).toBe(1);
    expect(result).toBeInstanceOf(YellowCollection);
    expect(result?.hashes).toHaveLength(letters.length);

    // Ensure all original unique hashes are present and fake hashes are added to reach the required length
    const originalUniqueChars = new Set(letters.map(l => l.char));
    const resultHashes = result!.hashes.map(h => h.value);

    // This is a probabilistic check, but with 10 iterations and random hashes, it's highly unlikely to fail
    // We can't directly check for the original char hashes without re-hashing, which defeats the purpose of YellowCollection's obscurity.
    // Instead, we'll check that the number of unique hashes in the collection is equal to the word length,
    // implying that fake hashes were added for duplicates.
    expect(new Set(resultHashes).size).toBe(letters.length);
  });

  it("contains$ should return true for a letter present in the collection", async () => {
    const letters = [
      new Letter("A", 0),
      new Letter("B", 1),
    ];
    const yellowCollection = (await lastValueFrom(
      YellowCollection.create$(letters, testSalt, testIterations)
    )).result!;

    const letterToCheck = new Letter("A", 5); // Position doesn't matter for yellow hash
    const { progress, result } = await lastValueFrom(
      yellowCollection.contains$(letterToCheck)
    );

    expect(progress).toBe(1);
    expect(result).toBe(true);
  });

  it("contains$ should return false for a letter not present in the collection", async () => {
    const letters = [
      new Letter("A", 0),
      new Letter("B", 1),
    ];
    const yellowCollection = (await lastValueFrom(
      YellowCollection.create$(letters, testSalt, testIterations)
    )).result!;

    const letterToCheck = new Letter("Z", 0);
    const { progress, result } = await lastValueFrom(
      yellowCollection.contains$(letterToCheck)
    );

    expect(progress).toBe(1);
    expect(result).toBe(false);
  });

  it("toJSON and fromJSON should correctly serialize and deserialize YellowCollection", async () => {
    const letters = [
      new Letter("X", 0),
      new Letter("Y", 1),
    ];
    const originalYellowCollection = (await lastValueFrom(
      YellowCollection.create$(letters, testSalt, testIterations)
    )).result!;

    const json = originalYellowCollection.toJSON();
    const restoredYellowCollection = YellowCollection.fromJSON(json);

    expect(restoredYellowCollection).toBeInstanceOf(YellowCollection);
    expect(restoredYellowCollection.hashes.map(h => h.value)).toEqual(originalYellowCollection.hashes.map(h => h.value));
    expect(restoredYellowCollection.salt).toBe(originalYellowCollection.salt);
    expect(restoredYellowCollection.iterations).toBe(originalYellowCollection.iterations);
  });
});
