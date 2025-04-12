import { useState } from 'react';
import { checkWord } from '@/entities/word';
import type { GuessResult } from '@/entities/word';

const WORD_LENGTH = 5;
const MAX_TRIES = 6;

const DEFAULT_TARGET = 'REACT';

export default function useWordleGame(): UseWordleGame {
  const [targetWord, setTargetWord] = useState(DEFAULT_TARGET);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [isWin, setIsWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const submitGuess = (guess: string) => {
    if (isGameOver || guess.length !== WORD_LENGTH) return;

    const statuses = checkWord(targetWord, guess);
    const result: GuessResult = { word: guess, statuses };

    setGuesses((prev) => [...prev, result]);

    if (guess === targetWord) {
      setIsWin(true);
      setIsGameOver(true);
    } else if (guesses.length + 1 >= MAX_TRIES) {
      setIsGameOver(true);
    }
  };

  const restart = () => {
    setTargetWord(DEFAULT_TARGET);
    setGuesses([]);
    setIsWin(false);
    setIsGameOver(false);
  };

  return {
    targetWord,
    guesses,
    isWin,
    isGameOver,
    submitGuess,
    restart,
  };
}

interface UseWordleGame {
  targetWord: string;
  guesses: GuessResult[];
  isWin: boolean;
  isGameOver: boolean;
  submitGuess: (guess: string) => void;
  restart: () => void;
}

export type { UseWordleGame };
