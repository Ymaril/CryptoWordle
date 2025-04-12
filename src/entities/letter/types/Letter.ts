import { UppercaseLetter } from "@/shared/types";

export enum LetterStatus {
  Correct,
  Misplaced,
  Wrong,
}

export default interface Letter {
  char: UppercaseLetter;
  status: LetterStatus;
}
