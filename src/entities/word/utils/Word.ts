import { combineLatest, map, Observable } from "rxjs";
import { Letter } from "@/entities/letter";
import EncryptedWord from "./EncryptedWord";
import type { UppercaseLetter } from "@/shared/types";
import GreenHash from "./GreenHash";
import YellowCollection from "./YellowCollection";

export interface WordEncryptionProgress {
  progress: number;
  letterProgresses: { green: number; yellow: number }[];
  result?: EncryptedWord;
}

export default class Word {
  readonly letters: Letter[];

  constructor(word: string) {
    this.letters = word
      .toUpperCase()
      .split("")
      .map((char, i) => new Letter(char as UppercaseLetter, i));
  }

  toEncryptedWord$(
    salt: string,
    iterations: number,
  ): Observable<WordEncryptionProgress> {
    const greenHashes$ = combineLatest(
      this.letters.map((letter) => GreenHash.create$(letter, salt, iterations)),
    );

    const yellowCollection$ = YellowCollection.create$(this, salt, iterations);

    return combineLatest([greenHashes$, yellowCollection$]).pipe(
      map(([greenProgresses, yellowProgress]) => {
        const greenLetterProgresses = greenProgresses.map((p) => p.progress);
        const yellowLetterProgresses = yellowProgress.letterProgresses;

        const overallGreenProgress =
          greenLetterProgresses.reduce((s, p) => s + p, 0) /
          greenLetterProgresses.length;
        const progress =
          (overallGreenProgress + yellowProgress.progress) / 2;

        const letterProgresses = this.letters.map((_, i) => ({
          green: greenLetterProgresses[i],
          yellow: yellowLetterProgresses[i],
        }));

        const result =
          progress === 1
            ? new EncryptedWord(
                greenProgresses.map((p) => p.result!),
                yellowProgress.result!,
              )
            : undefined;

        return {
          progress,
          letterProgresses,
          result,
        };
      }),
    );
  }
}
