import { Observable, combineLatest, map, shareReplay, takeWhile } from "rxjs";
import { decodeBase64Url, encodeBase64Url } from "@/shared/utils";
import type { Hash } from "@/shared/types";
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

  constructor(greenHashes: Hash[], yellowHashes: Hash[], salt: string = "", iterations: number = 5000) {
    this.greenHashes = greenHashes;
    this.yellowHashes = yellowHashes;
    this.salt = salt;
    this.iterations = iterations;
  }

  toBase64Url(): string {
    return encodeBase64Url(
      JSON.stringify({
        green: this.greenHashes,
        yellow: this.yellowHashes,
        salt: this.salt,
        iterations: this.iterations,
      }),
    );
  }

  static fromBase64Url(encoded: string): EncryptedWord {
    const { green, yellow, salt, iterations } = JSON.parse(decodeBase64Url(encoded));
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
    const green$ = letter.greenHash$(this.salt, this.iterations).pipe(shareReplay(1));
    const yellow$ = letter.yellowHash$(this.salt, this.iterations).pipe(shareReplay(1));
  
    return combineLatest([green$, yellow$]).pipe(
      map(([green, yellow]) => {
        const greenHash = green.result;
        const yellowHash = yellow.result;

        if (greenHash) {
          if (greenHash === this.greenHashes[letter.position]) {
            return { progress: 1, status: GuessedLetterStatus.Correct };
          }
  
          if (yellowHash) {
            if(this.yellowHashes.includes(yellowHash)) {
              return { progress: 1, status: GuessedLetterStatus.Misplaced };
            }

            return { progress: 1, status: GuessedLetterStatus.Wrong };
          }
        }
  
        return { progress: (green.progress + yellow.progress) / 2, status: null };
      }),
      takeWhile(({ status }) => status === null, true),
      shareReplay(1)
    );
  }
}
