export type LetterStatus = "correct" | "misplaced" | "wrong";

export interface GuessResult {
  word: string;
  statuses: LetterStatus[];
}

export default function checkWord(
  target: string,
  guess: string,
): LetterStatus[] {
  const result: LetterStatus[] = Array(guess.length).fill("wrong");
  const used = Array(target.length).fill(false);

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] !== "correct") {
      const index = target
        .split("")
        .findIndex((char, idx) => char === guess[i] && !used[idx]);
      if (index !== -1) {
        result[i] = "misplaced";
        used[index] = true;
      }
    }
  }

  return result;
}
