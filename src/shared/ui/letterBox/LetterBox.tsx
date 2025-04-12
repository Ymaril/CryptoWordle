import styles from "./LetterBox.module.css";

export type LetterStatus = "correct" | "misplaced" | "wrong" | "default";

interface LetterBoxProps {
  letter?: string;
  status?: LetterStatus;
}

export default function LetterBox({
  letter = "",
  status = "default",
}: LetterBoxProps) {
  return <div className={`${styles.box} ${styles[status]}`}>{letter}</div>;
}
