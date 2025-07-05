import { describe, it, expect } from "vitest";
import { lastValueFrom } from "rxjs";
import { EncryptedWord, Word } from "@/entities/word";
import { GuessedLetterStatus } from "@/entities/letter";

const { Correct, Misplaced, Wrong } = GuessedLetterStatus;

// --- Hardcoded, DECODED test data, generated via Word.toEncryptedWord$ ---
const HELLO_DECODED = {
  green: [
    "220183d83f83d4f46f81889590c73e2fa7f3d43bd183c663d19096238999e53d",
    "6467afe056efc9a2a99b5e17f2d9c39a545fadd78e64f0eb68a461039bacae0e",
    "7a094991b06472dd5cab5744f525acd19e7f2f760d3fc028c4e75cf928516446",
    "ab7953bae459d0898900179f742b864bf1a1a5ea1b3332298b3ca0fe424a98e4",
    "5f929543811239b900a6173312c5106370d1fdceaf2bbf1da3fbb56b8f96bf9b",
  ],
  yellow: [
    "05fc87f3b30865616710a49519dcb60aa36ea7823aadb558ca447c785e9471f7",
    "197a886172d0340d383c0676e1a6b37e38961ab8875c5d934f47bd0a3e3d210d",
    "f7175ecadbd3f4449120d8c3c8060590d265d59236ee89e271b073c9601dbae4",
    "6d83a9f11c20cf316eac11c23b1ff34805988eb569864fb12c93580c87288f13",
    "8df55cbf61fed32171f601f2ff73897552c549d99c97a312d736a6c8c5ff6b6e",
  ],
  salt: "test-salt",
  iterations: 2,
};

const APPLE_DECODED = {
  green: [
    "4f078ae845b2b94fb645ee6c797690f5ff627c75077c56543522227d92771d50",
    "c3cd1eae0d358d4d242d999a3dc2371acdb6a79c5d680dbce96d0d4a4522aac6",
    "f9eea79c6658c0fb2571582b2e8028c7aae1ad827555f4727a2f9dfe77944915",
    "ab7953bae459d0898900179f742b864bf1a1a5ea1b3332298b3ca0fe424a98e4",
    "556098032924b13f1596f12e54c54306e54375bdba9cae5979c6f76d1864b61e",
  ],
  yellow: [
    "e02e9a298a8c4f71645ff3b64f4f7931de8c0eba9679f596c815ff828220b67f",
    "9cd0bba922f0504349f696cd15e41af213e9c80ea6f31076f8ced81bdf330ae9",
    "05fc87f3b30865616710a49519dcb60aa36ea7823aadb558ca447c785e9471f7",
    "9823b542342402d0b8635226904c61a08c3fa49180bb068bb5d6c2cae35a60d3",
    "f7175ecadbd3f4449120d8c3c8060590d265d59236ee89e271b073c9601dbae4",
  ],
  salt: "test-salt",
  iterations: 2,
};
// ------------------------------------

async function checkGuess(decodedData: any, guessWord: string) {
  const encryptedWord = new EncryptedWord(
    decodedData.green,
    decodedData.yellow,
    decodedData.salt,
    decodedData.iterations,
  );
  const guess = new Word(guessWord);
  const { result } = await lastValueFrom(encryptedWord.checkWord$(guess));
  expect(result).toBeDefined();
  return result!;
}

describe("EncryptedWord: Edge Cases with Duplicates (Real Hashes)", () => {
  describe("Target: HELLO (H-E-L-L-O)", () => {
    it("Guess: LEVEL (L-E-V-E-L) - should follow the implemented hash-checking logic", async () => {
      const result = await checkGuess(HELLO_DECODED, "LEVEL");
      expect(result.letters.map((l) => l.status)).toEqual([
        Misplaced,
        Correct,
        Wrong,
        Misplaced,
        Misplaced,
      ]);
    }, 10000);
  });

  describe("Target: APPLE (A-P-P-L-E)", () => {
    it("Guess: POPPY (P-O-P-P-Y) - should follow the implemented hash-checking logic", async () => {
      const result = await checkGuess(APPLE_DECODED, "POPPY");
      expect(result.letters.map((l) => l.status)).toEqual([
        Misplaced,
        Wrong,
        Correct,
        Misplaced,
        Wrong,
      ]);
    }, 10000);
  });
});
