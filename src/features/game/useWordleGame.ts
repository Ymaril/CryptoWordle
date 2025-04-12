import { useEffect, useState } from "react";
import { GuessedWord, Word, EncryptedWord } from "@/entities/word";

const WORD_LENGTH = 5;
const MAX_TRIES = 6;

export default function useWordleGame(): UseWordleGame {
  const [targetEncrypted, setTargetEncrypted] = useState<EncryptedWord | null>(
    null,
  );
  const [guessedWords, setGuessedWords] = useState<GuessedWord[]>([]);
  const [isWin, setIsWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [checkProgress, setCheckProgress] = useState<number | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    try {
      const encrypted = EncryptedWord.fromBase64Url(hash);
      setTargetEncrypted(encrypted);
    } catch (e) {
      console.error("Невозможно прочитать зашифрованное слово из URL", e);
    }
  }, []);

  const submitGuess = (guessText: string) => {
    if (!targetEncrypted || isGameOver || guessText.length !== WORD_LENGTH)
      return;

    const guessWord = new Word(guessText);

    const sub = targetEncrypted
      .checkWord$(guessWord)
      .subscribe(({ progress, result }) => {
        setCheckProgress(progress);

        if (result) {
          setGuessedWords((prev) => {
            const next = [...prev, result];

            if (result.isCorrect()) {
              setIsWin(true);
              setIsGameOver(true);
            } else if (next.length >= MAX_TRIES) {
              setIsGameOver(true);
            }

            return next;
          });

          setCheckProgress(null);
          sub.unsubscribe(); // поток больше не нужен
        }
      });
  };

  const restart = () => {
    setGuessedWords([]);
    setIsWin(false);
    setIsGameOver(false);
    setCheckProgress(null);
  };

  return {
    targetWord: targetEncrypted,
    guessedWords,
    isWin,
    isGameOver,
    checkProgress,
    submitGuess,
    restart,
  };
}

export interface UseWordleGame {
  targetWord: EncryptedWord | null;
  guessedWords: GuessedWord[];
  isWin: boolean;
  isGameOver: boolean;
  checkProgress: number | null;
  submitGuess: (guess: string) => void;
  restart: () => void;
}
