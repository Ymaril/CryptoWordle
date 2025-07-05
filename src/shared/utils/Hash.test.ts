// src/shared/utils/Hash.test.ts
import { describe, it, expect } from "vitest";
import Hash from "./Hash";

describe("Hash Class", () => {
  it("should return true for two identical full-length hashes", () => {
    const hash1 = new Hash("abcdef123456");
    const hash2 = new Hash("abcdef123456");
    expect(hash1.equals(hash2)).toBe(true);
  });

  it("should return true when comparing a full hash to its prefix", () => {
    const fullHash = new Hash("abcdef123456");
    const prefixHash = new Hash("abcdef");
    expect(fullHash.equals(prefixHash)).toBe(true);
  });

  it("should return true when comparing a prefix to its full hash", () => {
    const prefixHash = new Hash("abcdef");
    const fullHash = new Hash("abcdef123456");
    expect(prefixHash.equals(fullHash)).toBe(true);
  });

  it("should return true when comparing a hash instance to a matching string prefix", () => {
    const fullHash = new Hash("abcdef123456");
    const prefixString = "abcdef";
    expect(fullHash.equals(prefixString)).toBe(true);
  });

  it("should return false for two different hashes of the same length", () => {
    const hash1 = new Hash("abcdef123456");
    const hash2 = new Hash("654321fedcba");
    expect(hash1.equals(hash2)).toBe(false);
  });

  it("should return false for non-matching prefixes", () => {
    const hash1 = new Hash("abcdef123");
    const hash2 = new Hash("abcxyz789");
    expect(hash1.equals(hash2)).toBe(false);
  });

  it("should handle case-insensitivity correctly", () => {
    const hash1 = new Hash("ABCDEF");
    const hash2 = new Hash("abcdef");
    expect(hash1.equals(hash2)).toBe(true);
  });

  it("should return the original string value via toString()", () => {
    const value = "abcdef123456";
    const hash = new Hash(value);
    expect(hash.toString()).toBe(value);
  });
});
