import Letter, { GuessedLetterStatus } from "../types/GuessedLetter";
import styles from "./LetterBox.module.css";

const STATUS_STYLES = {
  [GuessedLetterStatus.Correct]: styles.correct,
  [GuessedLetterStatus.Misplaced]: styles.misplaced,
  [GuessedLetterStatus.Wrong]: styles.wrong,
};

export default function LetterBox({ letter }: { letter: Letter }) {
  const { char, status } = letter;

  return (
    <div className={`${styles.box} ${STATUS_STYLES[status]}`} role="gridcell">
      {char}
    </div>
  );
}
