import { Observable, combineLatest, map, shareReplay, takeWhile } from "rxjs";
import { decodeBase64Url, encodeBase64Url } from "@/shared/utils";
import type { Hash as HashString } from "@/shared/types";
import { Hash } from "@/shared/utils";
import Word from "./Word";
import { GuessedLetterStatus, Letter } from "@/entities/letter";
import GuessedWord from "./GuessedWord";

export interface CompareProgress {
  progress: number;
  result?: GuessedWord;
}

export default class EncryptedWord {
  readonly greenHashes: Hash[];
  readonly yellowHashes: Hash[];
  readonly salt: string;
  readonly iterations: number;

  constructor(
    greenHashes: HashString[],
    yellowHashes: HashString[],
    salt: string = "",
    iterations: number = 5000,
  ) {
    this.greenHashes = greenHashes.map((h) => new Hash(h));
    this.yellowHashes = yellowHashes.map((h) => new Hash(h));
    this.salt = salt;
    this.iterations = iterations;
  }

  get length(): number {
    return this.greenHashes.length;
  }

  toBase64Url(length: number = 64): string {
    return encodeBase64Url(
      JSON.stringify({
        green: this.greenHashes.map((h) => h.toString(length)),
        yellow: this.yellowHashes.map((h) => h.toString(length)),
        salt: this.salt,
        iterations: this.iterations,
      }),
    );
  }

  static fromBase64Url(encoded: string): EncryptedWord {
    const { green, yellow, salt, iterations } = JSON.parse(
      decodeBase64Url(encoded),
    );
    return new EncryptedWord(green, yellow, salt, iterations);
  }

  checkWord$(word: Word): Observable<{
    progress: number;
    result?: GuessedWord;
  }> {
    const letterStreams = word.letters.map((letter) =>
      this.checkLetter$(letter).pipe(
        map(({ progress, status }) => ({
          char: letter.char,
          progress,
          status,
        })),
      ),
    );

    return combineLatest(letterStreams).pipe(
      map((letters) => {
        const progress =
          letters.reduce((sum, l) => sum + l.progress, 0) / letters.length;
        if (progress !== 1) return { progress };

        const guessedLetters = letters.map(({ char, status }) => ({
          char,
          status: status!,
        }));

        return {
          progress: 1,
          result: new GuessedWord(guessedLetters),
        };
      }),
    );
  }

  checkLetter$(letter: Letter): Observable<{
    progress: number;
    status: GuessedLetterStatus | null;
  }> {
    const green$ = letter
      .greenHash$(this.salt, this.iterations)
      .pipe(shareReplay(1));
    const yellow$ = letter
      .yellowHash$(this.salt, this.iterations)
      .pipe(shareReplay(1));

    return combineLatest([green$, yellow$]).pipe(
      map(([green, yellow]) => {
        const greenHash = green.result;
        const yellowHash = yellow.result;

        if (greenHash) {
          if (this.greenHashes[letter.position].equals(greenHash)) {
            return { progress: 1, status: GuessedLetterStatus.Correct };
          }

          if (yellowHash) {
            if (this.yellowHashes.some((h) => h.equals(yellowHash))) {
              return { progress: 1, status: GuessedLetterStatus.Misplaced };
            }

            return { progress: 1, status: GuessedLetterStatus.Wrong };
          }
        }

        return {
          progress: (green.progress + yellow.progress) / 2,
          status: null,
        };
      }),
      takeWhile(({ status }) => status === null, true),
      shareReplay(1),
    );
  }
}
