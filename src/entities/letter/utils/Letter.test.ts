import { describe, it, expect } from "vitest";
import { Letter } from "@/entities/letter";
import { lastValueFrom } from "rxjs";

describe("Letter (Real Implementation)", () => {
  const testSalt = "salt";
  const testIterations = 2; // Use low iterations for speed

  it("greenHash$ should produce a valid hash", async () => {
    const letter = new Letter("A", 2);
    const result = await lastValueFrom(
      letter.greenHash$(testSalt, testIterations),
    );
    expect(result.progress).toBe(1);
    expect(typeof result.result).toBe("string");
    expect(result.result).not.toBe("");
  });

  it("yellowHash$ should produce a valid hash", async () => {
    const letter = new Letter("B", 3);
    const result = await lastValueFrom(
      letter.yellowHash$(testSalt, testIterations),
    );
    expect(result.progress).toBe(1);
    expect(typeof result.result).toBe("string");
    expect(result.result).not.toBe("");
  });

  it("encrypt$ should produce two different, valid hashes", async () => {
    const letter = new Letter("C", 1);
    const result = await lastValueFrom(
      letter.encrypt$(testSalt, testIterations),
    );

    expect(result.progress).toBe(1);
    expect(typeof result.greenHash).toBe("string");
    expect(typeof result.yellowHash).toBe("string");
    expect(result.greenHash).not.toEqual(result.yellowHash);
  });

  it("two letters with the same char but different positions should have different green hashes", async () => {
    const letter1 = new Letter("A", 1);
    const letter2 = new Letter("A", 2);

    const result1 = await lastValueFrom(
      letter1.greenHash$(testSalt, testIterations),
    );
    const result2 = await lastValueFrom(
      letter2.greenHash$(testSalt, testIterations),
    );

    expect(result1.result).not.toEqual(result2.result);
  });

  it("two letters with the same char should have the same yellow hash", async () => {
    const letter1 = new Letter("A", 1);
    const letter2 = new Letter("A", 2);

    const result1 = await lastValueFrom(
      letter1.yellowHash$(testSalt, testIterations),
    );
    const result2 = await lastValueFrom(
      letter2.yellowHash$(testSalt, testIterations),
    );

    expect(result1.result).toEqual(result2.result);
  });
});
