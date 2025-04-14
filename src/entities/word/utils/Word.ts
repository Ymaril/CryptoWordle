import {
  combineLatest,
  map,
  Observable,
  shareReplay,
} from "rxjs";
import { Letter, LetterEncryptProgress } from "@/entities/letter";
import EncryptedWord from "./EncryptedWord";
import type { Hash, UppercaseLetter } from "@/shared/types";
import { shuffleArray } from "@/shared/utils";

export default class Word {
  readonly letters: Letter[];

  constructor(word: string) {
    this.letters = word
      .toUpperCase()
      .split("")
      .map((char, i) => new Letter(char as UppercaseLetter, i));
  }

  lettersEncrypt$(salt: string = "", iterations: number = 5000): Observable<LetterEncryptProgress[]> {
    return combineLatest(
      this.letters.map((l) => l.encrypt$(salt, iterations))
    ).pipe(shareReplay(1));
  }

  encrypt$(salt: string = "", iterations: number = 5000): Observable<{
    progress: number;
    letters: LetterEncryptProgress[];
  }> {
    return this.lettersEncrypt$(salt, iterations).pipe(
      map((letters) => ({
        letters,
        progress:
          letters.reduce((sum, l) => sum + l.progress, 0) / letters.length,
      })),
      shareReplay(1)
    );
  }

  toEncryptedWord$(
    salt: string = "",
    iterations: number = 5000
  ): Observable<{
    progress: number;
    letters: LetterEncryptProgress[];
    result?: EncryptedWord;
  }> {
    return this.encrypt$(salt, iterations).pipe(
      map((encryptProgress) => {
        const { progress, letters } = encryptProgress;

        const allDone = progress === 1;
        const result = allDone
          ? new EncryptedWord(
              letters.map((p) => p.greenHash!),
              this.prepareYellowHashes(letters.map((p) => p.yellowHash!)),
              salt,
              iterations
            )
          : undefined;
  
        return { result, ...encryptProgress };
      }),
      shareReplay(1)
    );
  }

  private prepareYellowHashes(hashes: Hash[]): Hash[] {
    const seen = new Set(hashes);
    const numFakesNeeded = hashes.length - seen.size;
  
    const fakeHashes = Array.from({ length: numFakesNeeded }, () =>
      this.generateFakeHash(hashes[0].length)
    );
  
    return shuffleArray([...seen, ...fakeHashes]);
  }  

  private generateFakeHash(length: number): string {
    return Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }
}
