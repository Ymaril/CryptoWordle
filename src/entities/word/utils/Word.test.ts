import { describe, it, expect } from "vitest";
import { Word } from "@/entities/word";
import { Letter } from "@/entities/letter";
import { lastValueFrom } from "rxjs";
import EncryptedWord from "./EncryptedWord";

describe("Word (Real Implementation)", () => {
  it("should create an array of Letter instances", () => {
    const word = new Word("HELLO");
    expect(word.letters).toHaveLength(5);
    expect(word.letters[0]).toBeInstanceOf(Letter);
    expect(word.letters[0].char).toBe("H");
    expect(word.letters[4].position).toBe(4);
  });

  it("encrypt$ should produce a final progress of 1", async () => {
    const word = new Word("TEST");
    const result = await lastValueFrom(word.encrypt$("", 2)); // Low iterations
    expect(result.progress).toBe(1);
    expect(result.letters).toHaveLength(4);
    // Check that one of the hashes is a non-empty string
    expect(typeof result.letters[0].greenHash).toBe("string");
  });

  it("toEncryptedWord$ should create a real EncryptedWord", async () => {
    const word = new Word("HELLO");
    const { result } = await lastValueFrom(word.toEncryptedWord$("", 2));
    expect(result).toBeInstanceOf(EncryptedWord);
    expect(result?.greenHashes).toHaveLength(5);
    expect(result?.greenHashes[0]).not.toBe("");
  });

  it("prepareYellowHashes should handle duplicates and add fakes", () => {
    const word = new Word("LEVEL"); // L is duplicated
    // @ts-ignore - accessing private method for testing
    const yellowHashes = word.prepareYellowHashes([
      "hash-L",
      "hash-E",
      "hash-V",
      "hash-E", // duplicate
      "hash-L", // duplicate
    ]);
    expect(yellowHashes).toHaveLength(5);
    expect(new Set(yellowHashes).size).toBe(5);
    expect(yellowHashes).toContain("hash-L");
    expect(yellowHashes).toContain("hash-E");
    expect(yellowHashes).toContain("hash-V");
  });
});
