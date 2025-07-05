import { describe, it, expect } from "vitest";
import { lastValueFrom } from "rxjs";
import { EncryptedWord, Word } from "@/entities/word";
import { GuessedLetterStatus } from "@/entities/letter";
import { Letter } from "@/entities/letter";

// --- Test Configuration ---
const TEST_ITERATIONS = 2; // Low iterations for fast, but real, tests
const TEST_SALT = "test-salt";
// --------------------------

async function createHonestEncryptedWord(word: string): Promise<EncryptedWord> {
  const target = new Word(word);
  const greenHashes = await Promise.all(
    target.letters.map((letter: Letter) =>
      lastValueFrom(letter.greenHash$(TEST_SALT, TEST_ITERATIONS)).then(
        (h) => h.result,
      ),
    ),
  );
  const yellowHashes = await Promise.all(
    target.letters.map((letter: Letter) =>
      lastValueFrom(letter.yellowHash$(TEST_SALT, TEST_ITERATIONS)).then(
        (h) => h.result,
      ),
    ),
  );
  const uniqueYellowHashes = [...new Set(yellowHashes)];
  return new EncryptedWord(
    greenHashes,
    uniqueYellowHashes,
    TEST_SALT,
    TEST_ITERATIONS,
  );
}

async function checkGuess(targetWord: string, guessWord: string) {
  const encryptedWord = await createHonestEncryptedWord(targetWord);
  const guess = new Word(guessWord);
  const { result } = await lastValueFrom(encryptedWord.checkWord$(guess));
  return result;
}

describe("CryptoWordle Core Logic (Honest Tests)", () => {
  it("should correctly identify a perfect match", async () => {
    const result = await checkGuess("LEVEL", "LEVEL");
    expect(result.isCorrect()).toBe(true);
  });

  it("should handle a mix of statuses correctly", async () => {
    const result = await checkGuess("LEVEL", "APPLE");
    expect(result.letters.map((l) => l.status)).toEqual([
      GuessedLetterStatus.Wrong,
      GuessedLetterStatus.Wrong,
      GuessedLetterStatus.Wrong,
      GuessedLetterStatus.Misplaced,
      GuessedLetterStatus.Misplaced,
    ]);
  });

  it("should handle complex duplicates", async () => {
    const result = await checkGuess("SPOON", "BOOKS");
    expect(result.letters.map((l) => l.status)).toEqual([
      GuessedLetterStatus.Wrong,
      GuessedLetterStatus.Misplaced,
      GuessedLetterStatus.Correct,
      GuessedLetterStatus.Wrong,
      GuessedLetterStatus.Misplaced,
    ]);
  });
});
