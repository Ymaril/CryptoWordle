import { Observable, combineLatest, map, of, switchMap } from "rxjs";
import { decodeBase64Url, encodeBase64Url } from "@/shared/utils";
import Word from "./Word";
import { GuessedLetterStatus, Letter } from "@/entities/letter";
import GuessedWord from "./GuessedWord";
import GreenHash from "./GreenHash";
import YellowCollection from "./YellowCollection";
import Hash from "@/shared/utils/Hash";

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

  toBase64Url(length?: number): string {
    const data = {
      green: this.greenHashes.map((h) => h.toJSON(length)),
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
    const greenHashToCompare = this.greenHashes[letter.position];

    const greenCheck$ = GreenHash.create$(
      letter,
      greenHashToCompare.salt,
      greenHashToCompare.iterations,
    );

    const yellowCheck$ = this.yellowCollection.contains$(letter);

    return combineLatest([greenCheck$, yellowCheck$]).pipe(
      map(([greenProgress, yellowProgress]) => {
        const progress = (greenProgress.progress + yellowProgress.progress) / 2;

        if (progress < 1) {
          return { progress, status: null };
        }

        if (greenHashToCompare.equals(greenProgress.result!)) {
          return { progress: 1, status: GuessedLetterStatus.Correct };
        }

        if (yellowProgress.result) {
          return { progress: 1, status: GuessedLetterStatus.Misplaced };
        }

        return { progress: 1, status: GuessedLetterStatus.Wrong };
      }),
    );
  }
}
