import { describe, it, expect, vi, beforeEach } from "vitest";
import { Letter } from "@/entities/letter";
import { lastValueFrom, of } from "rxjs";
import heavyHash$ from "@/shared/utils/heavyHash$";

vi.mock("@/shared/utils/heavyHash$");

describe("Letter", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Provide a default mock implementation for heavyHash$
    vi.mocked(heavyHash$).mockReturnValue(
      of({ progress: 1, result: "mock-hash" }),
    );
  });

  it("greenHash$ should include position in the hash input", async () => {
    const letter = new Letter("A", 2);
    letter.greenHash$("salt", 100);
    // Expect the input to heavyHash$ to be "position:char:salt"
    expect(heavyHash$).toHaveBeenCalledWith("2:Asalt", 100);
  });

  it("yellowHash$ should not include position in the hash input", async () => {
    const letter = new Letter("B", 3);
    letter.yellowHash$("salt", 100);
    // Expect the input to heavyHash$ to be "char:salt"
    expect(heavyHash$).toHaveBeenCalledWith("Bsalt", 100);
  });

  it("encrypt$ should combine results from green and yellow hashes", async () => {
    vi.mocked(heavyHash$).mockImplementation((input) => {
      if (input.startsWith("1:C")) {
        return of({ progress: 1, result: "green-result" });
      }
      return of({ progress: 1, result: "yellow-result" });
    });

    const letter = new Letter("C", 1);
    const result = await lastValueFrom(letter.encrypt$());

    expect(result.progress).toBe(1);
    expect(result.greenHash).toBe("green-result");
    expect(result.yellowHash).toBe("yellow-result");
  });

  it("should not include hash results until progress is 1", async () => {
    // Simulate partial progress
    vi.mocked(heavyHash$).mockReturnValue(
      of({ progress: 0.5, result: "final-hash" }),
    );

    const letter = new Letter("D", 0);
    // We need to access the private hash$ method, so we use a little trick
    // @ts-ignore
    const result = await lastValueFrom(letter.hash$("test", 100));

    expect(result.progress).toBe(0.5);
    expect(result.result).toBeUndefined();
  });
});
