import { Observable, combineLatest, map } from "rxjs";
import { decodeBase64Url, encodeBase64Url } from "@/shared/utils";
import { Word } from "@/entities/word/@x/encryptedWord";
import { GuessedWord } from "@/entities/guessedWord/@x/encryptedWord";
import GreenHash from "./GreenHash";
import YellowCollection from "./YellowCollection";
import {
  GuessedLetterStatus,
  Letter,
} from "@/entities/letter/@x/encryptedWord";
import { UppercaseLetter } from "@/shared/types";
import type { WordEncryptionProgress } from "../types";
import protobuf from "protobufjs";

export default class EncryptedWord {
  readonly greenHashes: GreenHash[];
  readonly yellowCollection: YellowCollection;

  constructor(greenHashes: GreenHash[], yellowCollection: YellowCollection) {
    this.greenHashes = greenHashes;
    this.yellowCollection = yellowCollection;
  }

  get length(): number {
    return this.greenHashes.length;
  }

  static fromWord$(
    word: Word,
    salt: string,
    iterations: number,
  ): Observable<WordEncryptionProgress> {
    const greenHashes$ = combineLatest(
      word.letters.map((letter: Letter) =>
        GreenHash.create$(letter, salt, iterations),
      ),
    );

    const yellowCollection$ = YellowCollection.create$(
      word.letters,
      salt,
      iterations,
    );

    return combineLatest([greenHashes$, yellowCollection$]).pipe(
      map(([greenProgresses, yellowProgress]) => {
        const greenLetterProgresses = greenProgresses.map(
          (p: { progress: number; result?: GreenHash }) => p.progress,
        );
        const yellowLetterProgresses = yellowProgress?.letterProgresses || [];

        const overallGreenProgress =
          greenLetterProgresses.reduce((s: number, p: number) => s + p, 0) /
          greenLetterProgresses.length;
        const progress =
          (overallGreenProgress + (yellowProgress?.progress || 0)) / 2;

        const letterProgresses = word.letters.map((_: Letter, i: number) => ({
          green: greenLetterProgresses[i],
          yellow: yellowLetterProgresses[i],
        }));

        const result =
          progress === 1
            ? new EncryptedWord(
                greenProgresses.map(
                  (p: { progress: number; result?: GreenHash }) => p.result!,
                ),
                yellowProgress!.result!,
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

  toBase64Url(length?: number): string {
    const data = {
      green: this.greenHashes.map((h: GreenHash) => h.toJSON(length)),
      yellow: this.yellowCollection.toJSON(length),
    };
    return encodeBase64Url(JSON.stringify(data));
  }

  static fromBase64Url(encoded: string): EncryptedWord {
    const { green, yellow } = JSON.parse(decodeBase64Url(encoded));
    return new EncryptedWord(
      green.map(GreenHash.fromJSON),
      YellowCollection.fromJSON(yellow),
    );
  }

  checkWord$(word: Word): Observable<{
    progress: number;
    result?: GuessedWord;
  }> {
    const letterStreams = word.letters.map((letter: Letter) =>
      this.checkLetter$(letter).pipe(
        map(({ progress, status }) => ({
          char: letter.char,
          progress,
          status,
        })),
      ),
    );

    return combineLatest(letterStreams).pipe(
      map(
        (
          letters: {
            char: UppercaseLetter;
            progress: number;
            status: GuessedLetterStatus | null;
          }[],
        ) => {
          const progress =
            letters.reduce(
              (sum: number, l: { progress: number }) => sum + l.progress,
              0,
            ) / letters.length;
          if (progress !== 1) return { progress };

          const guessedLetters = letters.map(({ char, status }) => ({
            char,
            status: status!,
          }));

          return {
            progress: 1,
            result: new GuessedWord(guessedLetters),
          };
        },
      ),
    );
  }

  checkLetter$(letter: Letter): Observable<{
    progress: number;
    status: GuessedLetterStatus | null;
  }> {
    const greenHashToCompare = this.greenHashes[letter.position];

    const greenCheck$ = GreenHash.create$(
      letter,
      greenHashToCompare.salt,
      greenHashToCompare.iterations,
    );

    const yellowCheck$ = this.yellowCollection.contains$(letter);

    return combineLatest([greenCheck$, yellowCheck$]).pipe(
      map(([greenProgress, yellowProgress]) => {
        const progress =
          (greenProgress.progress + (yellowProgress?.progress || 0)) / 2;

        if (progress < 1) {
          return { progress, status: null };
        }

        if (greenHashToCompare.equals(greenProgress.result!)) {
          return { progress: 1, status: GuessedLetterStatus.Correct };
        }

        if (yellowProgress?.result) {
          return { progress: 1, status: GuessedLetterStatus.Misplaced };
        }

        return { progress: 1, status: GuessedLetterStatus.Wrong };
      }),
    );
  }
}

