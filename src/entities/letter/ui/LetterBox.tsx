import Letter, { LetterStatus } from "../types/Letter";
import styles from "./LetterBox.module.css";

const STATUS_STYLES = {
  [LetterStatus.Correct]: styles.correct,
  [LetterStatus.Misplaced]: styles.misplaced,
  [LetterStatus.Wrong]: styles.wrong,
};

export default function LetterBox({ letter }: { letter: Letter }) {
  const { char, status } = letter;

  return <div className={`${styles.box} ${STATUS_STYLES[status]}`}>{char}</div>;
}
