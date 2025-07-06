import { describe, it, expect } from "vitest";
import { lastValueFrom } from "rxjs";
import GreenHash from "./GreenHash";
import { Letter } from "@/entities/letter";
import Hash from "@/shared/utils/Hash";

describe("GreenHash", () => {
  const testSalt = "test-salt";
  const testIterations = 10; // Low iterations for speed

  it("GreenHash.create$ should generate a valid GreenHash object", async () => {
    const letter = new Letter("A", 0);
    const { progress, result } = await lastValueFrom(
      GreenHash.create$(letter, testSalt, testIterations)
    );

    expect(progress).toBe(1);
    expect(result).toBeInstanceOf(GreenHash);
    expect(result?.hash).toBeInstanceOf(Hash);
    expect(result?.salt).toBe(testSalt);
    expect(result?.iterations).toBe(testIterations);
  });

  it("equals should return true for two identical GreenHash instances", async () => {
    const letter = new Letter("B", 1);
    const greenHash1 = (await lastValueFrom(
      GreenHash.create$(letter, testSalt, testIterations)
    )).result!;
    const greenHash2 = (await lastValueFrom(
      GreenHash.create$(letter, testSalt, testIterations)
    )).result!;

    expect(greenHash1.equals(greenHash2)).toBe(true);
  });

  it("equals should return false for two different GreenHash instances", async () => {
    const letter1 = new Letter("C", 2);
    const letter2 = new Letter("D", 3);
    const greenHash1 = (await lastValueFrom(
      GreenHash.create$(letter1, testSalt, testIterations)
    )).result!;
    const greenHash2 = (await lastValueFrom(
      GreenHash.create$(letter2, testSalt, testIterations)
    )).result!;

    expect(greenHash1.equals(greenHash2)).toBe(false);
  });

  it("toJSON and fromJSON should correctly serialize and deserialize GreenHash", async () => {
    const letter = new Letter("E", 4);
    const originalGreenHash = (await lastValueFrom(
      GreenHash.create$(letter, testSalt, testIterations)
    )).result!;

    const json = originalGreenHash.toJSON();
    const restoredGreenHash = GreenHash.fromJSON(json);

    expect(restoredGreenHash).toBeInstanceOf(GreenHash);
    expect(restoredGreenHash.hash.value).toBe(originalGreenHash.hash.value);
    expect(restoredGreenHash.salt).toBe(originalGreenHash.salt);
    expect(restoredGreenHash.iterations).toBe(originalGreenHash.iterations);
  });
});
