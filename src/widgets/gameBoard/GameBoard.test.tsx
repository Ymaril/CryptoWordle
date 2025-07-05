import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import App from "@/app/ui/App";

describe("GameBoard Integration Test", () => {
  beforeEach(() => {
    // Mock window.location to prevent errors in jsdom and provide necessary properties
    Object.defineProperty(window, "location", {
      value: {
        hash: "",
        origin: "http://localhost:3000",
        pathname: "/",
        assign: () => {}, // Mock assign to prevent errors
      },
      writable: true,
    });
  });

  it("should display the game board, allow guesses, and reflect letter statuses correctly", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    const testWord = "REACT";
    const wrongGuess = "WORLD";
    const correctGuess = "REACT";

    // --- Step 1: Generate the encrypted word ---
    const encryptInput = screen.getByPlaceholderText("Enter any word");
    const encryptButton = screen.getByRole("button", { name: /encrypt/i });
    const iterationsSlider = screen.getByLabelText(/iterations/i);

    // Set iterations to minimum for speed
    await user.type(iterationsSlider, "500");
    await user.type(encryptInput, testWord);
    await user.click(encryptButton);

    const resultLinkInput = await screen.findByLabelText(
      /the url:/i,
      {},
      { timeout: 30000 },
    );
    const generatedHash = (resultLinkInput as HTMLInputElement).value.split(
      "#",
    )[1];
    expect(generatedHash).toBeDefined();

    // --- Step 2: Start the game with the generated hash ---
    unmount(); // Unmount the previous App instance
    window.location.hash = `#${generatedHash}`;
    render(<App />);

    // --- Step 3: Make a wrong guess ---
    const wordInput = screen.getByLabelText(/verification input/i);
    await user.type(wordInput, wrongGuess);

    // --- Step 4: Verify the result of the wrong guess ---
    await waitFor(
      async () => {
        const firstRow = screen.getAllByRole("row")[0];
        const letters = await within(firstRow).findAllByTestId("letter-box");
        expect(letters).toHaveLength(5);
        // We don't know the exact statuses, but we know it's not all correct
        const isAnyCorrect = letters.some((letter) =>
          letter.className.includes("correct"),
        );
        expect(isAnyCorrect).toBe(false);
      },
      { timeout: 30000 },
    );

    // --- Step 5: Make the correct guess ---
    // The same input is reused for the next guess
    await user.type(wordInput, correctGuess);

    // --- Step 6: Verify the result of the correct guess ---
    await waitFor(
      async () => {
        const secondRow = screen.getAllByRole("row")[1];
        const letters = await within(secondRow).findAllByTestId("letter-box");
        const areAllCorrect = letters.every((letter) =>
          letter.className.includes("correct"),
        );
        expect(areAllCorrect).toBe(true);
      },
      { timeout: 30000 },
    );
  }, 60000); // Give this whole test a long timeout
});
