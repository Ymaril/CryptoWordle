import type { UppercaseLetter } from "@/shared/types";
import { LetterStatus } from "@/entities/letter";
import type { Letter } from "@/entities/letter";
import GuessedWord from "./GuessedWord";

export default function guessWord(target: string, guess: string): GuessedWord {
  const targetChars = target.split("");
  const guessChars = guess.split("");

  const result: Letter[] = guessChars.map((char, _) => ({
    char: char as UppercaseLetter,
    status: LetterStatus.Wrong,
  }));

  const usedInTarget = Array(target.length).fill(false);

  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i].status = LetterStatus.Correct;
      usedInTarget[i] = true;
    }
  }

  for (let i = 0; i < guessChars.length; i++) {
    if (result[i].status === LetterStatus.Correct) continue;

    for (let j = 0; j < targetChars.length; j++) {
      if (!usedInTarget[j] && guessChars[i] === targetChars[j]) {
        result[i].status = LetterStatus.Misplaced;
        usedInTarget[j] = true;
        break;
      }
    }
  }

  return new GuessedWord(result);
}
