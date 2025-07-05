import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import WordEncryptor from "./WordEncryptor";

// Mocking clipboard API for jsdom environment
Object.assign(navigator, {
  clipboard: {
    writeText: () => Promise.resolve(),
  },
});

describe("WordEncryptor Component", () => {
  beforeEach(() => {
    // Mock window.location to prevent errors in jsdom and provide necessary properties
    Object.defineProperty(window, "location", {
      value: {
        hash: "",
        origin: "http://localhost:3000",
        pathname: "/",
      },
      writable: true,
    });
  });

  it("should allow a user to enter a word, encrypt it, and see the result link", async () => {
    const user = userEvent.setup();
    render(<WordEncryptor />);

    const testWord = "HELLO";

    // 1. Find the input field and the encrypt button
    const inputField = screen.getByPlaceholderText("Enter any word");
    const encryptButton = screen.getByRole("button", { name: /encrypt/i });

    // 2. Simulate user typing the word
    await user.type(inputField, testWord);
    expect(inputField).toHaveValue(testWord);

    // 3. Simulate user clicking the encrypt button
    await user.click(encryptButton);

    // 4. Wait for the encryption to finish and the result link to appear
    // We find the result input by its label "The url:"
    const resultLinkInput = await screen.findByLabelText(
      /the url:/i,
      {},
      { timeout: 30000 },
    );

    // 5. Assert that the result input is now visible and contains the generated link
    expect(resultLinkInput).toBeInTheDocument();
    const linkValue = (resultLinkInput as HTMLInputElement).value;
    expect(linkValue).toContain("#");
    expect(linkValue).toContain("ey"); // All our base64 hashes start with "ey"
  }, 30000);

  it("should allow the user to copy the link", async () => {
    const user = userEvent.setup();
    render(<WordEncryptor />);

    const testWord = "COPY";

    // Encrypt the word first
    const inputField = screen.getByPlaceholderText("Enter any word");
    const encryptButton = screen.getByRole("button", { name: /encrypt/i });
    await user.type(inputField, testWord);
    await user.click(encryptButton);

    // Wait for the copy button to appear
    const copyButton = await screen.findByRole(
      "button",
      { name: /copy/i },
      { timeout: 30000 },
    );
    expect(copyButton).toBeInTheDocument();

    // Click the copy button
    await user.click(copyButton);

    // Check that the button text changes to "Copied!"
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /copied!/i }),
      ).toBeInTheDocument();
    });
  }, 30000);
});
