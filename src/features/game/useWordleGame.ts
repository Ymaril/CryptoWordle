import { useState } from "react";
import { GuessedWord, guessWord } from "@/entities/word";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;

const DEFAULT_TARGET = "REACT";

export default function useWordleGame(): UseWordleGame {
  const [targetWord, setTargetWord] = useState(DEFAULT_TARGET);
  const [guessedWords, setGuessedWords] = useState<GuessedWord[]>([]);
  const [isWin, setIsWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const submitGuess = (guess: string) => {
    if (isGameOver || guess.length !== WORD_LENGTH) return;

    const guessedWord = guessWord(targetWord, guess);

    setGuessedWords((prev) => [...prev, guessedWord]);

    if (guessedWord.isCorrect()) {
      setIsWin(true);
      setIsGameOver(true);
    } else if (guessedWords.length + 1 >= MAX_TRIES) {
      setIsGameOver(true);
    }
  };

  const restart = () => {
    setTargetWord(DEFAULT_TARGET);
    setGuessedWords([]);
    setIsWin(false);
    setIsGameOver(false);
  };

  return {
    targetWord,
    guessedWords,
    isWin,
    isGameOver,
    submitGuess,
    restart,
  };
}

interface UseWordleGame {
  targetWord: string;
  guessedWords: GuessedWord[];
  isWin: boolean;
  isGameOver: boolean;
  submitGuess: (guess: string) => void;
  restart: () => void;
}

export type { UseWordleGame };
