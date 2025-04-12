import { UppercaseLetter } from "@/shared/types";

export enum GuessedLetterStatus {
  Correct,
  Misplaced,
  Wrong,
}

export default interface GuessedLetter {
  char: UppercaseLetter;
  status: GuessedLetterStatus;
}
