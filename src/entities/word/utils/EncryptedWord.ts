import { Encrypted, decodeBase64Url, encodeBase64Url } from "@/shared/utils";

export class EncryptedWord {
  private encryptedLetters: Encrypted[];
  private encryptedAlphabet: Encrypted[];

  constructor(encryptedLetters: Encrypted[], encryptedAlphabet: Encrypted[]) {
    this.encryptedLetters = encryptedLetters;
    this.encryptedAlphabet = encryptedAlphabet;
  }

  get length(): number {
    return this.encryptedLetters.length;
  }

  get letters(): Encrypted[] {
    return this.encryptedAlphabet;
  }

  toBase64Url(): string {
    return encodeBase64Url(JSON.stringify({ 
      letters: this.encryptedLetters,
      alphabet: this.encryptedAlphabet
    }));
  }
  
  static fromBase64Url(encoded: string): EncryptedWord {
    const obj = JSON.parse(decodeBase64Url(encoded));
    return new EncryptedWord(obj.letters, obj.alphabet);
  }
}
