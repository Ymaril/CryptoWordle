import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import App from "@/app/ui/App";

describe("Partial Hash Integration Test", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        hash: "",
        origin: "http://localhost:3000",
        pathname: "/",
        assign: () => {},
      },
      writable: true,
    });
  });

  it("should correctly guess a word when using a partial hash", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    const testWord = "PARTIAL";
    const hashLength = "8";

    // --- Step 1: Generate the encrypted word with a short hash ---
    const encryptInput = screen.getByPlaceholderText("Enter any word");
    const encryptButton = screen.getByRole("button", { name: /encrypt/i });
    const hashLengthSlider = screen.getByLabelText(/hash length/i);

    await user.type(hashLengthSlider, hashLength);
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

    // --- Step 2: Start the game with the generated partial hash ---
    unmount();
    window.location.hash = `#${generatedHash}`;
    render(<App />);

    // --- Step 3: Make the correct guess ---
    const wordInput = screen.getByLabelText(/verification input/i);
    await user.type(wordInput, testWord);

    // --- Step 4: Verify the result ---
    await waitFor(
      async () => {
        const row = await screen.findByRole("row");
        const letters = await within(row).findAllByRole("gridcell");
        const areAllCorrect = letters.every((letter) =>
          letter.className.includes("correct"),
        );
        expect(areAllCorrect).toBe(true);
      },
      { timeout: 30000 },
    );
  }, 60000);
});
