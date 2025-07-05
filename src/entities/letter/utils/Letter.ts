import { UppercaseLetter } from "@/shared/types";

export default class Letter {
  readonly char: UppercaseLetter;
  readonly position: number;

  constructor(char: UppercaseLetter, position: number) {
    this.char = char;
    this.position = position;
  }
}
