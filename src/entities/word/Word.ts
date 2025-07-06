import { Letter } from "@/entities/letter/@x/word";
import type { UppercaseLetter } from "@/shared/types";

export default class Word {
  readonly letters: Letter[];

  constructor(word: string) {
    this.letters = word
      .toUpperCase()
      .split("")
      .map((char, i) => new Letter(char as UppercaseLetter, i));
  }
}
