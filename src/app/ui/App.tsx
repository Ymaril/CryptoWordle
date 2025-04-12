import GameBoard from "@/widgets/gameBoard/GameBoard";
import "./App.css";
import WordEncryptor from "@/features/wordEncryptor";
import { useEffect } from "react";
import { Word } from "@/entities/word";

export default function App() {
  useEffect(() => {
    const targetWord = new Word("react");
    const guessWord = new Word("reabt");

    // Шифруем правильное слово
    targetWord.encrypt();

    const sub = targetWord.getProgress$().subscribe(({ progress, result }) => {
      console.log(`[target] Прогресс: ${Math.round(progress * 100)}%`);

      if (result) {
        console.log("[target] Зашифровано:", result);

        // сравниваем с другой попыткой
        result.compareWith$(guessWord).subscribe((guessedWord) => {
          console.log("[guess] Результат сравнения:");
          guessedWord.letters.forEach((l, i) => {
            console.log(`  Буква ${i + 1}: ${l.char} → ${l.status}`);
          });
        });

        sub.unsubscribe(); // отписываемся от target'а
      }
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <GameBoard />
      <WordEncryptor />
    </div>
  );
}
