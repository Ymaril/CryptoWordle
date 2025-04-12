import { BehaviorSubject, Observable, combineLatest, map } from "rxjs";
import EncryptedWord from "./EncryptedWord";
import { Char, Letter } from "@/entities/letter";
import { UppercaseLetter } from "@/shared/types";
import { EncryptProgress, shuffleArray } from "@/shared/utils";

interface WordEncryptProgress {
  progress: number;
  result?: EncryptedWord;
}

export default class Word {
  plainWord: string;
  letters: Letter[] = [];
  alphabet: Char[] = [];
  private progress$ = new BehaviorSubject<WordEncryptProgress>({ progress: 0 });

  private started = false;

  constructor(plainWord: string) {
    this.plainWord = plainWord.toUpperCase();

    for (let i = 0; i < this.plainWord.length; i++) {
      const char = this.plainWord[i] as UppercaseLetter;
      this.letters.push(new Letter(char, i));

      if (!this.alphabet.some((c) => c.char === char)) {
        this.alphabet.push(new Char(char));
      }

      this.alphabet = shuffleArray(this.alphabet);
    }
  }

  encrypt(): void {
    if (this.started) return;
    this.started = true;

    this.letters.forEach((letter) => letter.encrypt());
    this.alphabet.forEach((char) => char.encrypt());

    this.trackProgress();
  }

  private trackProgress() {
    const letterStreams = this.getLetterProgressStreams();
    const alphabetStreams = this.getAlphabetProgressStreams();

    combineLatest([
      combineLatest(letterStreams),
      combineLatest(alphabetStreams),
    ])
      .pipe(
        map(([letterProgresses, alphabetProgresses]) => {
          const all = [...letterProgresses, ...alphabetProgresses];
          const totalProgress =
            all.reduce((sum, p) => sum + p.progress, 0) / all.length;

          const allDone = all.every((p) => p.progress === 1);

          return {
            progress: totalProgress,
            result: allDone
              ? new EncryptedWord(
                  letterProgresses.map((p) => p.result!),
                  alphabetProgresses.map((p) => p.result!),
                )
              : undefined,
          };
        }),
      )
      .subscribe(this.progress$);
  }

  getProgress$(): Observable<WordEncryptProgress> {
    return this.progress$.asObservable();
  }

  getCurrentProgress(): WordEncryptProgress {
    return this.progress$.getValue();
  }

  getLetterProgressStreams(): Observable<EncryptProgress>[] {
    return this.letters.map((letter) => letter.getEncrypted$());
  }

  getAlphabetProgressStreams(): Observable<EncryptProgress>[] {
    return this.alphabet.map((char) => char.getEncrypted$());
  }
}
