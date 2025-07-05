import { LetterBox } from "@/entities/letter";
import type GuessedWord from "../utils/GuessedWord";
import styles from "./WordRow.module.css";

export default function WordRow({ guessedWord }: { guessedWord: GuessedWord }) {
  return (
    <div className={styles.row} role="row">
      {guessedWord.letters.map((letter, idx) => (
        <LetterBox key={idx} letter={letter} />
      ))}
    </div>
  );
}
