import { describe, it, expect } from "vitest";
import { Letter } from "@/entities/letter";

describe("Letter (Real Implementation)", () => {
  it("should create a Letter instance with correct char and position", () => {
    const letter = new Letter("A", 0);
    expect(letter.char).toBe("A");
    expect(letter.position).toBe(0);
  });
});
