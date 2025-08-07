// src/shared/utils/Hash.ts
import { Observable, map } from "rxjs";
import heavyHash$ from "./heavyHash$";

export interface HashProgress {
  progress: number;
  result?: Hash;
}

export default class Hash {
  readonly value: Uint8Array;

  constructor(value: Uint8Array | string) {
    if (typeof value === 'string') {
      // Convert hex string to Uint8Array for backward compatibility
      this.value = this.hexToUint8Array(value);
    } else {
      this.value = value;
    }
  }

  private hexToUint8Array(hex: string): Uint8Array {
    const cleanHex = hex.toLowerCase().replace(/[^0-9a-f]/g, '');
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
  }

  equals(another: Hash): boolean {
    const thisBytes = this.value;
    const otherBytes = another.value;
    
    // Compare the shorter length against the longer one
    const minLength = Math.min(thisBytes.length, otherBytes.length);
    
    // Compare byte by byte up to the minimum length
    for (let i = 0; i < minLength; i++) {
      if (thisBytes[i] !== otherBytes[i]) {
        return false;
      }
    }
    
    return true; // All compared bytes match
  }

  toString(length?: number): string {
    const hex = Array.from(this.value)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    if (length === undefined) return hex;
    return hex.substring(0, length);
  }

  truncate(byteLength: number): Hash {
    const truncatedBytes = this.value.slice(0, byteLength);
    return new Hash(truncatedBytes);
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
    const randomBytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
    return new Hash(randomBytes);
  }
}





