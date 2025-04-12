import type { UppercaseLetter } from "@/shared/types";
import { GuessedLetterStatus } from "@/entities/letter";
import type { GuessedLetter } from "@/entities/letter";
import GuessedWord from "./GuessedWord";

export default function guessWord(target: string, guess: string): GuessedWord {
  const targetChars = target.split("");
  const guessChars = guess.split("");

  const result: GuessedLetter[] = guessChars.map((char, _) => ({
    char: char as UppercaseLetter,
    status: GuessedLetterStatus.Wrong,
  }));

  const usedInTarget = Array(target.length).fill(false);

  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i].status = GuessedLetterStatus.Correct;
      usedInTarget[i] = true;
    }
  }

  for (let i = 0; i < guessChars.length; i++) {
    if (result[i].status === GuessedLetterStatus.Correct) continue;

    for (let j = 0; j < targetChars.length; j++) {
      if (!usedInTarget[j] && guessChars[i] === targetChars[j]) {
        result[i].status = GuessedLetterStatus.Misplaced;
        usedInTarget[j] = true;
        break;
      }
    }
  }

  return new GuessedWord(result);
}
