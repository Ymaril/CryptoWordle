import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import useWordleGame from "./useWordleGame";
import EncryptedWord from "@/entities/encryptedWord";
import { Word } from "@/entities/word";
import { lastValueFrom } from "rxjs";
import { heavyHash$ } from "@/shared/utils";

describe("useWordleGame Hook", () => {
  
  const testIterations = 10; // Low iterations for speed

  let encryptedLevelWord: EncryptedWord;

  beforeEach(async () => {
    // Reset URL hash before each test
    window.location.hash = "";
    vi.spyOn(console, "error").mockImplementation(() => {}); // Suppress expected errors

    // Generate the encrypted word once for all tests
    const word = new Word("LEVEL");
    const saltResult = await lastValueFrom(heavyHash$(word.letters.map(l => l.char).join(""), 1));
    const shortSalt = saltResult.result.substring(0, 8);

    const encryptionProgress = await lastValueFrom(
      EncryptedWord.fromWord$(word, shortSalt, testIterations)
    );
    encryptedLevelWord = encryptionProgress.result!;
    window.location.hash = encryptedLevelWord.toBase64Url();
  });

  it("should not initialize if hash is missing", () => {
    window.location.hash = ""; // Ensure hash is empty for this specific test
    const { result } = renderHook(() => useWordleGame());
    expect(result.current.targetWord).toBeNull();
    expect(result.current.wordLength).toBe(0);
  });

  it("should handle invalid hash gracefully", () => {
    window.location.hash = "#invalid-hash";
    const { result } = renderHook(() => useWordleGame());
    expect(result.current.targetWord).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it("should initialize correctly from a valid URL hash", async () => {
    const { result } = renderHook(() => useWordleGame());

    await waitFor(() => {
      expect(result.current.targetWord).toBeInstanceOf(EncryptedWord);
      expect(result.current.wordLength).toBe(5);
    });
  });

  it("should not accept guesses of the wrong length", async () => {
    const { result } = renderHook(() => useWordleGame());
    await waitFor(() => expect(result.current.wordLength).toBe(5));

    act(() => {
      result.current.submitGuess("FOUR");
    });

    expect(result.current.guessedWords).toHaveLength(0);
  });

  it("should process a guess and update game state", async () => {
    const { result } = renderHook(() => useWordleGame());
    await waitFor(() => expect(result.current.wordLength).toBe(5));

    act(() => {
      result.current.submitGuess("APPLE");
    });

    await waitFor(() => {
      expect(result.current.guessedWords).toHaveLength(1);
      expect(result.current.isWin).toBe(false);
      expect(result.current.checkProgress).toBeNull();
    });
  });

  it("should set isWin to true on a correct guess", async () => {
    const { result } = renderHook(() => useWordleGame());
    await waitFor(() => expect(result.current.wordLength).toBe(5));

    act(() => {
      result.current.submitGuess("LEVEL");
    });

    await waitFor(() => {
      expect(result.current.isWin).toBe(true);
    });
  });

  it("should restart the game, clearing state", async () => {
    const { result } = renderHook(() => useWordleGame());
    await waitFor(() => expect(result.current.wordLength).toBe(5));

    act(() => {
      result.current.submitGuess("APPLE");
    });

    await waitFor(() => expect(result.current.guessedWords).toHaveLength(1));

    act(() => {
      result.current.restart();
    });

    expect(result.current.guessedWords).toHaveLength(0);
    expect(result.current.isWin).toBe(false);
    expect(result.current.checkProgress).toBeNull();
  });

  it("should correctly process multiple incorrect guesses", async () => {
    const { result } = renderHook(() => useWordleGame());
    await waitFor(() => expect(result.current.wordLength).toBe(5));

    const incorrectGuesses = ["APPLE", "GRAPE", "MANGO"];

    for (const guess of incorrectGuesses) {
      act(() => {
        result.current.submitGuess(guess);
      });
    }

    await waitFor(() => {
      // After multiple incorrect guesses, the game should not be won,
      // and the guessed words should be in the history.
      expect(result.current.guessedWords).toHaveLength(incorrectGuesses.length);
      expect(result.current.isWin).toBe(false);
    });
  });
});
