import { Hash } from "@/shared/types";
import { UppercaseLetter } from "@/shared/types";
import { heavyHash$ } from "@/shared/utils";
import { Observable, combineLatest, map, shareReplay } from "rxjs";

export interface LetterEncryptProgress {
  progress: number;
  greenHash?: Hash;
  yellowHash?: Hash;
}

interface LetterHashProgress {
  progress: number;
  result?: Hash;
}

export default class Letter {
  readonly char: UppercaseLetter;
  readonly position: number;

  constructor(char: UppercaseLetter, position: number) {
    this.char = char;
    this.position = position;
  }

  greenHash$(
    salt: string = "",
    iterations: number = 5000,
  ): Observable<LetterHashProgress> {
    const input = `${this.position}:${this.char}${salt}`;
    return this.hash$(input, iterations);
  }

  yellowHash$(
    salt: string = "",
    iterations: number = 5000,
  ): Observable<LetterHashProgress> {
    const input = `${this.char}${salt}`;
    return this.hash$(input, iterations);
  }

  encrypt$(
    salt: string = "",
    iterations: number = 5000,
  ): Observable<LetterEncryptProgress> {
    const green$ = this.greenHash$(salt, iterations);
    const yellow$ = this.yellowHash$(salt, iterations);

    return combineLatest([green$, yellow$]).pipe(
      map(([green, yellow]) => ({
        progress: (green.progress + yellow.progress) / 2,
        greenHash: green.result,
        yellowHash: yellow.result,
      })),
      shareReplay(1),
    );
  }

  private hash$(
    input: string,
    iterations: number,
  ): Observable<LetterHashProgress> {
    return heavyHash$(input, iterations).pipe(
      map(({ progress, result, ...rest }) => ({
        progress,
        result: progress === 1 ? result : undefined,
        ...rest,
      })),
      shareReplay(1),
    );
  }
}
