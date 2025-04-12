import { Encrypted } from "@/shared/utils";

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
}
