import { describe, it, expect } from "vitest";
import { encodeBase64Url, decodeBase64Url } from "./base64url";

describe("base64url", () => {
  it("should correctly encode and decode a simple string", () => {
    const original = "hello world";
    const encoded = encodeBase64Url(original);
    const decoded = decodeBase64Url(encoded);
    expect(decoded).toBe(original);
  });

  it("should handle complex JSON objects", () => {
    const original = {
      a: 1,
      b: "test",
      c: { d: [1, 2, 3] },
      e: "!@#$%^&*()_+",
    };
    const encoded = encodeBase64Url(JSON.stringify(original));
    const decoded = JSON.parse(decodeBase64Url(encoded));
    expect(decoded).toEqual(original);
  });

  it("should produce URL-safe characters", () => {
    // A standard base64 string with unsafe characters
    const standardBase64 = "+/=";
    const encoded = encodeBase64Url(standardBase64);

    // Should not contain '+', '/', or '='
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
  });
});
