import { Encrypted, decodeBase64Url, encodeBase64Url } from "@/shared/utils";
import GuessedWord from "./GuessedWord";
import { GuessedLetter, GuessedLetterStatus } from "@/entities/letter";
import Word from "./Word";
import { Observable, filter, map, take } from "rxjs";

export default class EncryptedWord {
  private encryptedLetters: Encrypted[];
  private encryptedAlphabet: Encrypted[];

  constructor(encryptedLetters: Encrypted[], encryptedAlphabet: Encrypted[]) {
    this.encryptedLetters = encryptedLetters;
    this.encryptedAlphabet = encryptedAlphabet;
  }

  get length(): number {
    return this.encryptedLetters.length;
  }

  get letters(): Encrypted[] {
    return this.encryptedAlphabet;
  }

  toBase64Url(): string {
    return encodeBase64Url(
      JSON.stringify({
        letters: this.encryptedLetters,
        alphabet: this.encryptedAlphabet,
      }),
    );
  }

  static fromBase64Url(encoded: string): EncryptedWord {
    const obj = JSON.parse(decodeBase64Url(encoded));
    return new EncryptedWord(obj.letters, obj.alphabet);
  }

  compareWith$(word: Word): Observable<GuessedWord> {
    word.encrypt();

    return word.getProgress$().pipe(
      filter((p) => !!p.result),
      take(1),
      map(() => {
        const result: GuessedLetter[] = [];

        const attemptLetters = word.letters;
        const attemptEncrypted = attemptLetters.map(
          (l) => l.getEncryptedValue()!,
        );

        const used = Array(this.encryptedLetters.length).fill(false);

        // 1. Correct
        for (let i = 0; i < attemptLetters.length; i++) {
          const encrypted = attemptEncrypted[i];
          const isCorrect = encrypted === this.encryptedLetters[i];

          result.push({
            char: attemptLetters[i].char,
            status: isCorrect
              ? GuessedLetterStatus.Correct
              : GuessedLetterStatus.Wrong,
          });

          if (isCorrect) {
            used[i] = true;
          }
        }

        // 2. Misplaced
        for (let i = 0; i < attemptLetters.length; i++) {
          if (result[i].status === GuessedLetterStatus.Correct) continue;

          for (let j = 0; j < this.encryptedLetters.length; j++) {
            if (!used[j] && attemptEncrypted[i] === this.encryptedLetters[j]) {
              result[i].status = GuessedLetterStatus.Misplaced;
              used[j] = true;
              break;
            }
          }
        }

        return new GuessedWord(result);
      }),
    );
  }
}
