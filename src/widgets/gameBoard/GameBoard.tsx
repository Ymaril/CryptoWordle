import { useWordleGame } from "@/features/game";
import { WordInput, WordRow } from "@/entities/word";

export default function GameBoard() {
  const { guessedWords, isGameOver, isWin, submitGuess, restart } =
    useWordleGame();

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

      {!isGameOver && <WordInput onSubmit={submitGuess} />}

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
