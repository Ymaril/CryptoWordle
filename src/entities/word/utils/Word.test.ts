import { describe, it, expect, vi } from "vitest";
import { Word } from "@/entities/word";
import { Letter } from "@/entities/letter";
import { lastValueFrom, of } from "rxjs";
import EncryptedWord from "./EncryptedWord";

// Mock the Letter class to control its behavior in tests
vi.mock("@/entities/letter", async (importOriginal) => {
  const actual = await importOriginal();
  const LetterMock = vi.fn();
  LetterMock.prototype.encrypt$ = vi.fn(() =>
    of({
      progress: 1,
      greenHash: "mock-green",
      yellowHash: "mock-yellow",
    }),
  );
  return {
    ...actual,
    Letter: LetterMock,
  };
});

describe("Word", () => {
  it("should create an array of Letter instances from a string", () => {
    const word = new Word("HELLO");
    expect(word.letters).toHaveLength(5);
    expect(Letter).toHaveBeenCalledTimes(5);
    expect(Letter).toHaveBeenCalledWith("H", 0);
    expect(Letter).toHaveBeenCalledWith("O", 4);
  });

  it("should call encrypt$ on each letter for lettersEncrypt$", async () => {
    const word = new Word("TEST");
    await lastValueFrom(word.lettersEncrypt$());
    expect(Letter.prototype.encrypt$).toHaveBeenCalledTimes(4);
  });

  it("should calculate total encryption progress correctly", async () => {
    const word = new Word("TEST");
    const result = await lastValueFrom(word.encrypt$());
    expect(result.progress).toBe(1);
    expect(result.letters).toHaveLength(4);
  });

  it("should create an EncryptedWord when encryption is complete", async () => {
    const word = new Word("HELLO");
    const { result } = await lastValueFrom(word.toEncryptedWord$());
    expect(result).toBeInstanceOf(EncryptedWord);
    expect(result?.greenHashes).toHaveLength(5);
  });

  it("should handle duplicate yellow hashes and add fakes", () => {
    const word = new Word("LEVEL"); // L is duplicated
    // @ts-ignore - accessing private method for testing
    const yellowHashes = word.prepareYellowHashes([
      "hash-L",
      "hash-E",
      "hash-V",
      "hash-E", // duplicate
      "hash-L", // duplicate
    ]);
    // Should contain unique real hashes + 2 fakes
    expect(yellowHashes).toHaveLength(5);
    expect(new Set(yellowHashes).size).toBe(5); // All hashes must be unique
    expect(yellowHashes).toContain("hash-L");
    expect(yellowHashes).toContain("hash-E");
    expect(yellowHashes).toContain("hash-V");
  });
});
