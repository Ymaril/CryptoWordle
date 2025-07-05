// src/entities/word/utils/YellowCollection.ts
import { Observable, map, combineLatest } from "rxjs";
import Hash from "@/shared/utils/Hash";
import { Letter } from "@/entities/letter";
import { Word } from "..";
import { shuffleArray } from "@/shared/utils";

export interface ContainsProgress {
  progress: number;
  result?: boolean;
}

export default class YellowCollection {
  readonly hashes: Hash[];
  readonly salt: string;
  readonly iterations: number;

  constructor(hashes: Hash[], salt: string, iterations: number) {
    this.hashes = hashes;
    this.salt = salt;
    this.iterations = iterations;
  }

  private static _prepareHashes(
    hashes: Hash[],
    requiredLength: number,
  ): Hash[] {
    const seen = new Set<string>();
    const uniqueHashes: Hash[] = [];
    for (const hash of hashes) {
      if (!seen.has(hash.value)) {
        seen.add(hash.value);
        uniqueHashes.push(hash);
      }
    }

    const numFakesNeeded = requiredLength - uniqueHashes.length;
    const fakeHashes = Array.from({ length: numFakesNeeded }, () =>
      Hash.createRandom(),
    );

    return shuffleArray([...uniqueHashes, ...fakeHashes]);
  }

  static create$(
    word: Word,
    salt: string,
    iterations: number,
  ): Observable<{
    progress: number;
    letterProgresses: number[];
    result?: YellowCollection;
  }> {
    const letterHashStreams$ = word.letters.map((letter) =>
      Hash.create$(letter.char, salt, iterations),
    );

    return combineLatest(letterHashStreams$).pipe(
      map((hashProgresses) => {
        const letterProgresses = hashProgresses.map((p) => p.progress);
        const totalProgress =
          letterProgresses.reduce((sum, p) => sum + p, 0) /
          letterProgresses.length;

        if (totalProgress < 1) {
          return {
            progress: totalProgress,
            letterProgresses,
            result: undefined,
          };
        }

        const finalHashes = hashProgresses.map((p) => p.result!);
        const allHashes = this._prepareHashes(finalHashes, word.letters.length);

        return {
          progress: 1,
          letterProgresses,
          result: new YellowCollection(allHashes, salt, iterations),
        };
      }),
    );
  }

  contains$(letter: Letter): Observable<ContainsProgress> {
    const checkHash$ = Hash.create$(
      letter.char,
      this.salt,
      this.iterations,
    );

    return checkHash$.pipe(
      map(({ progress, result }) => {
        if (progress < 1) {
          return { progress, result: undefined };
        }
        const found = this.hashes.some((h) => h.equals(result!));
        return { progress: 1, result: found };
      }),
    );
  }

  toJSON(length?: number): {
    hashes: string[];
    salt: string;
    iterations: number;
  } {
    return {
      hashes: this.hashes.map((h) => h.toString(length)),
      salt: this.salt,
      iterations: this.iterations,
    };
  }

  static fromJSON(data: {
    hashes: string[];
    salt: string;
    iterations: number;
  }): YellowCollection {
    const hashes = data.hashes.map((h_str) => new Hash(h_str));
    return new YellowCollection(hashes, data.salt, data.iterations);
  }
}

