import { Letter, LetterStatus } from "@/entities/letter";

export default class GuessedWord {
  letters: Letter[];

  constructor(letters: Letter[]) {
    this.letters = letters;
  }

  isCorrect() {
    return this.letters.every(
      (letter) => letter.status === LetterStatus.Correct,
    );
  }
}
