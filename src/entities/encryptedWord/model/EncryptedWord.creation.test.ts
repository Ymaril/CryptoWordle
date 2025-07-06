import { describe, it, expect } from "vitest";
import { lastValueFrom } from "rxjs";
import EncryptedWord from "./EncryptedWord";
import { Word } from "@/entities/word";
import { heavyHash$ } from "@/shared/utils";

describe("EncryptedWord Creation", () => {
  const testIterations = 10; // Low iterations for speed

  it("should correctly encrypt a word into EncryptedWord instance", async () => {
    const wordText = "TEST";
    const word = new Word(wordText);
    const saltResult = await lastValueFrom(heavyHash$(wordText, 1));
    const salt = saltResult.result.substring(0, 8);

    const encryptionProgress = await lastValueFrom(
      EncryptedWord.fromWord$(word, salt, testIterations)
    );

    expect(encryptionProgress.progress).toBe(1);
    expect(encryptionProgress.result).toBeInstanceOf(EncryptedWord);
    expect(encryptionProgress.result?.length).toBe(wordText.length);
    expect(encryptionProgress.result?.greenHashes).toHaveLength(wordText.length);
    expect(encryptionProgress.result?.yellowCollection).toBeDefined();
  });

  it("should emit progress updates during encryption", async () => {
    const wordText = "HELLO";
    const word = new Word(wordText);
    const saltResult = await lastValueFrom(heavyHash$(wordText, 1));
    const salt = saltResult.result.substring(0, 8);

    const progressUpdates: number[] = [];
    await new Promise<void>(async (resolve) => {
      EncryptedWord.fromWord$(word, salt, testIterations).subscribe({
        next: (progress) => {
          progressUpdates.push(progress.progress);
        },
        complete: () => {
          resolve();
        },
      });
    });

    expect(progressUpdates.length).toBeGreaterThan(1);
    expect(progressUpdates[0]).toBeLessThan(1);
    expect(progressUpdates[progressUpdates.length - 1]).toBe(1);
  });

  it("should correctly encode to Base64Url and decode back to the original object", async () => {
    const wordText = "ENCODE";
    const word = new Word(wordText);
    const saltResult = await lastValueFrom(heavyHash$(wordText, 1));
    const salt = saltResult.result.substring(0, 8);

    const encryptionProgress = await lastValueFrom(
      EncryptedWord.fromWord$(word, salt, testIterations)
    );
    const originalEncryptedWord = encryptionProgress.result!;

    const base64UrlString = originalEncryptedWord.toBase64Url(32);

    // Check that the output is a valid base64url string (no +, /, or = characters)
    expect(base64UrlString).not.toContain("+");
    expect(base64UrlString).not.toContain("/");
    expect(base64UrlString).not.toContain("=");

    const restoredEncryptedWord = EncryptedWord.fromBase64Url(base64UrlString);

    // Check that the restored object is identical to the original in terms of hash values
    expect(
      restoredEncryptedWord.greenHashes.map((h) => h.hash.toString(32))
    ).toEqual(
      originalEncryptedWord.greenHashes.map((h) => h.hash.toString(32))
    );
    expect(
      restoredEncryptedWord.yellowCollection.hashes.map((h) => h.toString(32))
    ).toEqual(
      originalEncryptedWord.yellowCollection.hashes.map((h) => h.toString(32))
    );
    expect(restoredEncryptedWord.greenHashes[0].salt).toBe(originalEncryptedWord.greenHashes[0].salt);
    expect(restoredEncryptedWord.greenHashes[0].iterations).toBe(originalEncryptedWord.greenHashes[0].iterations);
  });
});
