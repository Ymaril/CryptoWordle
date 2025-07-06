import { GuessedLetter, GuessedLetterStatus } from "@/entities/letter/@x/guessedWord";

export default class GuessedWord {
  letters: GuessedLetter[];

  constructor(letters: GuessedLetter[]) {
    this.letters = letters;
  }

  isCorrect() {
    return this.letters.every(
      (letter) => letter.status === GuessedLetterStatus.Correct,
    );
  }
}
