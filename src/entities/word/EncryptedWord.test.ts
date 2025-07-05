import { describe, it, expect } from "vitest";
import { lastValueFrom } from "rxjs";
import { EncryptedWord, Word } from "@/entities/word";
import { GuessedLetterStatus } from "@/entities/letter";

const { Correct, Misplaced, Wrong } = GuessedLetterStatus;

// --- Hardcoded, DECODED test data ---
const LEVEL_DECODED = {
  green: [
    "cd74d10e25d6382bcec902ec434c51d2de3c8910a24f7c9ef6ec2ff6c6635e50",
    "6467afe056efc9a2a99b5e17f2d9c39a545fadd78e64f0eb68a461039bacae0e",
    "192a72e655f922a2653a33bf5a9b027e6a4a6868346a227fdc6a4b99920fec67",
    "338f141ccb488a33df33e1423c436a44162f6039e7630e70cfd9ac9c4ddd40a4",
    "2ac9d068f668a4681daf4a50e1b466b09d59c48ca09bd313c12a44bbdd250d30",
  ],
  yellow: [
    "f7175ecadbd3f4449120d8c3c8060590d265d59236ee89e271b073c9601dbae4",
    "05fc87f3b30865616710a49519dcb60aa36ea7823aadb558ca447c785e9471f7",
    "8b9499d7cf9ac2eef97661866261c694564d05ad035d1f41dbdd81b62c865b0c",
  ],
  salt: "test-salt",
  iterations: 2,
};
const SPOON_DECODED = {
  green: [
    "9adff0651c9a4a37bec4def95f3a2d25d2f80b73c2d324c464f69b47177c7466",
    "c3cd1eae0d358d4d242d999a3dc2371acdb6a79c5d680dbce96d0d4a4522aac6",
    "b0377c79af6e3c95574dcd1dcab09971b5b919bba19e133f36cd9bb53de03c9e",
    "1d1532ff2d3e0b77f32bccd8ad526a05333a81eaf5edc7d897688271c297dd77",
    "18b799f0d5a4a066dc4e513b7a8e5f57857e9c6b78466f81840bbdffde3f0ba6",
  ],
  yellow: [
    "030f8a1e1d346616a79de396a0512463b0da45f9b1a408e5286439f50e1dbd10",
    "e02e9a298a8c4f71645ff3b64f4f7931de8c0eba9679f596c815ff828220b67f",
    "6d83a9f11c20cf316eac11c23b1ff34805988eb569864fb12c93580c87288f13",
    "213933cb0cc4e91421ba943f9bc055e6d4838e0d19702fdb930f6345a0920fb6",
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

describe("CryptoWordle (Hardcoded, Decoded Tests)", () => {
  describe("Target: LEVEL", () => {
    it("should correctly identify a perfect match", async () => {
      const result = await checkGuess(LEVEL_DECODED, "LEVEL");
      expect(result.isCorrect()).toBe(true);
    });

    it("should handle a mix of statuses", async () => {
      const result = await checkGuess(LEVEL_DECODED, "APPLE");
      expect(result.letters.map((l) => l.status)).toEqual([
        Wrong,
        Wrong,
        Wrong,
        Misplaced,
        Misplaced,
      ]);
    });
  });

  describe("Target: SPOON", () => {
    it("should handle complex duplicates", async () => {
      const result = await checkGuess(SPOON_DECODED, "BOOKS");
      expect(result.letters.map((l) => l.status)).toEqual([
        Wrong,
        Misplaced,
        Correct,
        Wrong,
        Misplaced,
      ]);
    });
  });
});
