import { UppercaseLetter } from "@/shared/types";
import { Encryptable } from "@/shared/utils";

export default class Char extends Encryptable {
  char: UppercaseLetter;

  constructor(char: UppercaseLetter) {
    super();
    this.char = char;
  }

  protected getHashInput(): string {
    return `SET${this.char}`;
  }
}
