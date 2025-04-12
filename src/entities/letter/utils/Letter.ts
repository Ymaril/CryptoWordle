import { Hash } from "@/shared/types";
import { UppercaseLetter } from "@/shared/types";
import { HeavyHashProgress, heavyHash$ } from "@/shared/utils";
import { Observable, combineLatest, map, shareReplay } from "rxjs";

export interface LetterEncryptProgress {
  progress: number;
  greenHash?: Hash;
  yellowHash?: Hash;
}

export default class Letter {
  readonly char: UppercaseLetter;
  readonly position: number;

  readonly greenHash$: Observable<HeavyHashProgress>;
  readonly yellowHash$: Observable<HeavyHashProgress>;

  constructor(char: UppercaseLetter, position: number) {
    this.char = char;
    this.position = position;

    this.greenHash$ = heavyHash$(`${position}:${char}`, 5000).pipe(
      shareReplay(1),
    );
    this.yellowHash$ = heavyHash$(`${char}`, 5000).pipe(shareReplay(1));
  }

  encrypt$(): Observable<LetterEncryptProgress> {
    return combineLatest([this.greenHash$, this.yellowHash$]).pipe(
      map(([green, yellow]) => ({
        progress: (green.progress + yellow.progress) / 2,
        greenHash: green.result,
        yellowHash: yellow.result,
      })),
      shareReplay(1),
    );
  }
}
