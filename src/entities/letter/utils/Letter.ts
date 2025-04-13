import { Hash } from "@/shared/types";
import { UppercaseLetter } from "@/shared/types";
import { heavyHash$ } from "@/shared/utils";
import { Observable, combineLatest, map, shareReplay } from "rxjs";

export interface LetterEncryptProgress {
  progress: number;
  greenHash?: Hash;
  yellowHash?: Hash;
}

export default class Letter {
  readonly char: UppercaseLetter;
  readonly position: number;

  constructor(char: UppercaseLetter, position: number) {
    this.char = char;
    this.position = position;
  }

  encrypt$(salt: string = '', iterations: number = 5000): Observable<LetterEncryptProgress> {
    const greenInput = `${this.position}:${this.char}${salt}`; 
    const yellowInput = `${this.char}${salt}`;

    const green$ = heavyHash$(greenInput, iterations).pipe(shareReplay(1));
    const yellow$ = heavyHash$(yellowInput, iterations).pipe(shareReplay(1));

    return combineLatest([green$, yellow$]).pipe(
      map(([green, yellow]) => ({
        progress: (green.progress + yellow.progress) / 2,
        greenHash: green.result,
        yellowHash: yellow.result,
      })),
      shareReplay(1)
    );
  }
}
