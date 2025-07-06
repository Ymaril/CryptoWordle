import { describe, it, expect } from "vitest";
import { Word } from "@/entities/word";
import { Letter } from "@/entities/letter";

describe("Word", () => {
  it("should create an array of Letter instances", () => {
    const word = new Word("HELLO");
    expect(word.letters).toHaveLength(5);
    expect(word.letters[0]).toBeInstanceOf(Letter);
    expect(word.letters[0].char).toBe("H");
    expect(word.letters[4].position).toBe(4);
  });
});
