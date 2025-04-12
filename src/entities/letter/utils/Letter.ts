import { UppercaseLetter } from "@/shared/types";
import Char from "./Char";

export default class Letter extends Char {
  position: number;

  constructor(char: UppercaseLetter, position: number) {
    super(char);
    this.position = position;
  }

  getHashInput(): string {
    return `${this.position}${this.char}`;
  }
}
