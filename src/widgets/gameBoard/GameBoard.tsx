import { useEffect, useRef } from "react";
import { useWordleGame } from "@/features/game";
import { WordInput, WordRow } from "@/entities/word";
import styles from "./GameBoard.module.css";

export default function GameBoard() {
  const {
    guessedWords,
    isWin,
    submitGuess,
    checkProgress,
    wordLength
  } = useWordleGame();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [guessedWords.length]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollArea} ref={scrollRef}>
        {guessedWords.map((guessedWord, i) => (
          <WordRow key={i} guessedWord={guessedWord} />
        ))}
      </div>

      {checkProgress !== null && (
        <div style={{ marginTop: 12 }}>
          Checking: {Math.round(checkProgress * 100)}%
        </div>
      )}

      {!isWin && (
        <WordInput
          onSubmit={submitGuess}
          disabled={checkProgress !== null}
          length={wordLength}
        />
      )}
    </div>
  );
}
