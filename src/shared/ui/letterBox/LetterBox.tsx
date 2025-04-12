import React from "react";
import styles from "./LetterBox.module.css";

export type LetterStatus = "correct" | "misplaced" | "wrong" | "default";

interface LetterBoxProps {
  letter?: string;
  status?: LetterStatus;
}

export const LetterBox: React.FC<LetterBoxProps> = ({
  letter = "",
  status = "default",
}) => {
  return <div className={`${styles.box} ${styles[status]}`}>{letter}</div>;
};
