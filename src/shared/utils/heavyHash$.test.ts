import { describe, it, expect } from "vitest";
import heavyHash$ from "./heavyHash$";
import { lastValueFrom } from "rxjs";

describe("heavyHash$", () => {
  it("should produce a deterministic hash", async () => {
    const data = "test-data";
    const iterations = 100;

    const hash1$ = heavyHash$(data, iterations);
    const hash2$ = heavyHash$(data, iterations);

    const result1 = await lastValueFrom(hash1$);
    const result2 = await lastValueFrom(hash2$);

    expect(result1.result).toBeDefined();
    expect(result1.result).toEqual(result2.result);
  });

  it("should produce a different hash for different data", async () => {
    const data1 = "test-data-1";
    const data2 = "test-data-2";
    const iterations = 100;

    const hash1$ = heavyHash$(data1, iterations);
    const hash2$ = heavyHash$(data2, iterations);

    const result1 = await lastValueFrom(hash1$);
    const result2 = await lastValueFrom(hash2$);

    expect(result1.result).not.toEqual(result2.result);
  });
});
