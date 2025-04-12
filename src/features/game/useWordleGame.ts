import { useEffect, useState } from "react";
import { GuessedWord, Word, EncryptedWord } from "@/entities/word";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;

export default function useWordleGame(): UseWordleGame {
  const [targetEncrypted, setTargetEncrypted] = useState<EncryptedWord | null>(null);
  const [guessedWords, setGuessedWords] = useState<GuessedWord[]>([]);
  const [isWin, setIsWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // 1. Извлекаем и парсим зашифрованную цель
  useEffect(() => {
    const hash = window.location.hash.slice(1); // убираем #
    if (!hash) return;

    try {
      const encrypted = EncryptedWord.fromBase64Url(hash);
      setTargetEncrypted(encrypted);
    } catch (e) {
      console.error("Невозможно прочитать зашифрованное слово из URL", e);
    }
  }, []);

  // 2. Отправляем попытку
  const submitGuess = (guessText: string) => {
    if (!targetEncrypted || isGameOver || guessText.length !== WORD_LENGTH) return;

    const guessWord = new Word(guessText);

    targetEncrypted.compareWith$(guessWord).subscribe((guessedWord) => {
      setGuessedWords((prev) => {
        const next = [...prev, guessedWord];

        // победа?
        if (guessedWord.isCorrect()) {
          setIsWin(true);
          setIsGameOver(true);
        } else if (next.length >= MAX_TRIES) {
          setIsGameOver(true);
        }

        return next;
      });
    });
  };

  const restart = () => {
    // Можно перегенерировать хэш или оставить как есть
    setGuessedWords([]);
    setIsWin(false);
    setIsGameOver(false);
  };

  return {
    targetWord: targetEncrypted, // не строка, а EncryptedWord (или null)
    guessedWords,
    isWin,
    isGameOver,
    submitGuess,
    restart,
  };
}

interface UseWordleGame {
  targetWord: EncryptedWord | null;
  guessedWords: GuessedWord[];
  isWin: boolean;
  isGameOver: boolean;
  submitGuess: (guess: string) => void;
  restart: () => void;
}

export type { UseWordleGame };
