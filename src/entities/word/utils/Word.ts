import {
  combineLatest,
  filter,
  map,
  Observable,
  shareReplay,
  take,
} from "rxjs";
import { Letter, LetterEncryptProgress } from "@/entities/letter";
import EncryptedWord from "./EncryptedWord";
import type { UppercaseLetter } from "@/shared/types";

export default class Word {
  readonly letters: Letter[];

  constructor(word: string) {
    this.letters = word
      .toUpperCase()
      .split("")
      .map((char, i) => new Letter(char as UppercaseLetter, i));
  }

  lettersEncrypt$(): Observable<LetterEncryptProgress[]> {
    return combineLatest(this.letters.map((l) => l.encrypt$())).pipe(
      shareReplay(1),
    );
  }

  encrypt$(): Observable<{
    progress: number;
    letters: LetterEncryptProgress[];
  }> {
    return this.lettersEncrypt$().pipe(
      map((letters) => ({
        letters,
        progress:
          letters.reduce((sum, l) => sum + l.progress, 0) / letters.length,
      })),
      shareReplay(1),
    );
  }

  toEncryptedWord$(): Observable<EncryptedWord> {
    return this.lettersEncrypt$().pipe(
      filter((letters) => letters.every((p) => p.progress === 1)),
      take(1),
      map(
        (letters) =>
          new EncryptedWord(
            letters.map((p) => p.greenHash!),
            letters.map((p) => p.yellowHash!),
          ),
      ),
    );
  }
}
