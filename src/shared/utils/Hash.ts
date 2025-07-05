// src/shared/utils/Hash.ts
import { Observable, map } from "rxjs";
import heavyHash$ from "./heavyHash$";

export interface HashProgress {
  progress: number;
  result?: Hash;
}

export default class Hash {
  readonly value: string;

  constructor(value: string) {
    this.value = value.toLowerCase();
  }

  equals(another: Hash): boolean {
    const anotherValue = another.value;

    if (this.value.length < anotherValue.length) {
      return anotherValue.startsWith(this.value);
    } else {
      return this.value.startsWith(anotherValue);
    }
  }

  toString(length?: number): string {
    if (length === undefined) return this.value;
    return this.value.substring(0, length);
  }

  static create$(
    data: string,
    salt: string,
    iterations: number,
  ): Observable<HashProgress> {
    return heavyHash$(data + salt, iterations).pipe(
      map(({ progress, result }) => ({
        progress,
        result: progress === 1 ? new Hash(result) : undefined,
      })),
    );
  }

  static createRandom(): Hash {
    const randomValue = Array.from(
      globalThis.crypto.getRandomValues(new Uint8Array(32)),
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return new Hash(randomValue);
  }
}
