import { useWordleGame } from "@/features/game";
import GuessInputRow from "@/features/guessInputRow";
import { GuessResultRow } from "@/entities/word";

export default function GameBoard() {
  const { guesses, isGameOver, isWin, submitGuess, restart } = useWordleGame();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {guesses.map((guess, i) => (
        <GuessResultRow key={i} word={guess.word} statuses={guess.statuses} />
      ))}

      {!isGameOver && <GuessInputRow length={5} onSubmit={submitGuess} />}

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
