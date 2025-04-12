import { useWordleGame } from "@/features/game";
import { WordInput, WordRow } from "@/entities/word";

export default function GameBoard() {
  const {
    guessedWords,
    isGameOver,
    isWin,
    submitGuess,
    restart,
    checkProgress,
  } = useWordleGame();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
      }}
    >
      {guessedWords.map((guessedWord, i) => (
        <WordRow key={i} guessedWord={guessedWord} />
      ))}
      {checkProgress !== null && (
        <div style={{ marginTop: 12 }}>
          Проверка: {Math.round(checkProgress * 100)}%
        </div>
      )}

      {!isGameOver && (
        <WordInput onSubmit={submitGuess} disabled={checkProgress !== null} />
      )}

      {isGameOver && (
        <div style={{ marginTop: 20 }}>
          <h2>{isWin ? "🎉 Победа!" : "💀 Проигрыш"}</h2>
          <button onClick={restart} style={{ marginTop: 12 }}>
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  );
}
