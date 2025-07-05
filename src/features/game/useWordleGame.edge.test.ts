import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import useWordleGame from "./useWordleGame";

// We will use the hardcoded data from our other test file
const LEVEL_B64 =
  "eyJncmVlbiI6WyJjZDc0ZDEwZTI1ZDYzODJiY2VjOTAyZWM0MzRjNTFkMmRlM2M4OTEwYTI0ZjdjOWVmNmVjMmZmNmM2NjM1ZTUwIiwiNjQ2N2FmZTA1NmVmYzlhMmE5OWI1ZTE3ZjJkOWMzOWE1NDVmYWRkNzhlNjRmMGViNjhhNDYxMDM5YmFjYWUwZSIsIjE5MmE3MmU2NTVmOTIyYTI2NTNhMzNiZjVhOWIwMjdlNmE0YTY4NjgzNDZhMjI3ZmRjNmE0Yjk5OTIwZmVjNjciLCIzMzhmMTQxY2NiNDg4YTMzZGYzM2UxNDIzYzQzNmE0NDE2MmY2MDM5ZTc2MzBlNzBjZmQ5YWM5YzRkZGQ0MGE0IiwiMmFjOWQwNjhmNjY4YTQ2ODFkYWY0YTUwZTFiNDY2YjA5ZDU5YzQ4Y2EwOWJkMzEzYzEyYTQ0YmJkZDI1MGQzMCJdLCJ5ZWxsb3ciOlsiZjcxNzVlY2FkYmQzZjQ0NDkxMjBkOGMzYzgwNjA1OTBkMjY1ZDU5MjM2ZWU4OWUyNzFiMDczYzk2MDFkYmFlNCIsIjA1ZmM4N2YzYjMwODY1NjE2NzEwYTQ5NTE5ZGNiNjBhYTM2ZWE3ODIzYWFkYjU1OGNhNDQ3Yzc4NWU5NDcxZjciLCI4Yjk0OTlkN2NmOWFjMmVlZjk3NjYxODY2MjYxYzY5NDU2NGQwNWFkMDM1ZDFmNDFkYmRkODFiNjJjODY1YjBjIl0sInNhbHQiOiJ0ZXN0LXNhbHQiLCJpdGVyYXRpb25zIjoyfQ";

describe("useWordleGame Hook: Edge Cases", () => {
  beforeEach(() => {
    // Reset URL hash before each test
    window.location.hash = "";
    vi.spyOn(console, "error").mockImplementation(() => {}); // Suppress expected errors
  });

  it("should correctly process multiple incorrect guesses", async () => {
    window.location.hash = `#${LEVEL_B64}`;
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
