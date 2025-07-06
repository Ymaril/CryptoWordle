import { LetterBox } from "@/entities/letter";
import GuessedWord from "@/entities/guessedWord";
import { GuessedLetter } from "@/entities/letter/@x/guessedWord";
import styles from "./WordRow.module.css";

export default function WordRow({ guessedWord }: { guessedWord: GuessedWord }) {
  return (
    <div className={styles.row} role="row">
      {guessedWord.letters.map((letter: GuessedLetter, idx: number) => (
        <LetterBox key={idx} letter={letter} />
      ))}
    </div>
  );
}
