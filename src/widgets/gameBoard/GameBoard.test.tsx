import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import App from "@/app/ui/App";

// Helper function to generate a hash and start the game
const startGameWithWord = async (word: string) => {
  const user = userEvent.setup();
  const { unmount } = render(<App />);

  const encryptInput = screen.getByPlaceholderText("Enter any word");
  const encryptButton = screen.getByRole("button", { name: /encrypt/i });
  const iterationsSlider = screen.getByLabelText(/iterations/i);

  // Set iterations to minimum for speed
  await user.type(iterationsSlider, "500");
  await user.type(encryptInput, word);
  await user.click(encryptButton);

  const resultLinkInput = await screen.findByLabelText(
    /the url:/i,
    {},
    { timeout: 30000 },
  );
  const generatedHash = (resultLinkInput as HTMLInputElement).value.split(
    "#",
  )[1];

  unmount();
  window.location.hash = `#${generatedHash}`;
  render(<App />);

  return { user };
};

describe("GameBoard Integration Test", () => {
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

  it("should render the correct number of empty rows initially", async () => {
    await startGameWithWord("TEST");
    const rows = screen.queryAllByRole("row");
    // Initially, there are no guessed words, so no rows should be rendered.
    expect(rows).toHaveLength(0);
  }, 30000);

  it("should display a row with all wrong letters for a completely incorrect guess", async () => {
    const { user } = await startGameWithWord("REACT");
    const wordInput = screen.getByLabelText(/verification input/i);
    await user.type(wordInput, "SOUND");

    await waitFor(
      async () => {
        const row = await screen.findByRole("row");
        const letters = await within(row).findAllByTestId("letter-box");
        const areAllWrong = letters.every((letter) =>
          letter.className.includes("wrong"),
        );
        expect(letters).toHaveLength(5);
        expect(areAllWrong).toBe(true);
      },
      { timeout: 30000 },
    );
  }, 60000);

  it("should display a row with all correct letters for a correct guess", async () => {
    const { user } = await startGameWithWord("REACT");
    const wordInput = screen.getByLabelText(/verification input/i);
    await user.type(wordInput, "REACT");

    await waitFor(
      async () => {
        const row = await screen.findByRole("row");
        const letters = await within(row).findAllByTestId("letter-box");
        const areAllCorrect = letters.every((letter) =>
          letter.className.includes("correct"),
        );
        expect(areAllCorrect).toBe(true);
      },
      { timeout: 30000 },
    );
  }, 60000);
});
