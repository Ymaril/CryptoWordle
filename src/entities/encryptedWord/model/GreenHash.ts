// src/entities/word/utils/GreenHash.ts
import { Letter } from "@/entities/letter";
import Hash from "@/shared/utils/Hash";
import { Observable, map } from "rxjs";

export default class GreenHash {
  readonly hash: Hash;
  readonly salt: string;
  readonly iterations: number;

  constructor(hash: Hash, salt: string, iterations: number) {
    this.hash = hash;
    this.salt = salt;
    this.iterations = iterations;
  }

  static create$(
    letter: Letter,
    salt: string,
    iterations: number,
  ): Observable<{ progress: number; result?: GreenHash }> {
    const data = `${letter.position}:${letter.char}`;

    return Hash.create$(data, salt, iterations).pipe(
      map(({ progress, result }) => ({
        progress,
        result: result ? new GreenHash(result, salt, iterations) : undefined,
      })),
    );
  }

  equals(another: GreenHash): boolean {
    return this.hash.equals(another.hash);
  }

  toJSON(length?: number): {
    value: string;
    salt: string;
    iterations: number;
  } {
    return {
      value: this.hash.toString(length),
      salt: this.salt,
      iterations: this.iterations,
    };
  }

  static fromJSON(data: {
    value: string;
    salt: string;
    iterations: number;
  }): GreenHash {
    const hash = new Hash(data.value);
    return new GreenHash(hash, data.salt, data.iterations);
  }
}
