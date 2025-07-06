import type EncryptedWord from "../model/EncryptedWord";

export interface WordEncryptionProgress {
  progress: number;
  letterProgresses: { green: number; yellow: number }[];
  result?: EncryptedWord;
}
