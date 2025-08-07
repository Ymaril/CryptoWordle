import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import WordEncryptor from "./WordEncryptor";

// Helper function to perform the encryption action
const encryptWord = async (word: string) => {
  const user = userEvent.setup();
  render(<WordEncryptor />);

  const inputField = screen.getByPlaceholderText("Enter any word");
  const encryptButton = screen.getByRole("button", { name: /encrypt/i });

  await user.type(inputField, word);
  await user.click(encryptButton);

  const resultLinkInput = await screen.findByLabelText(
    /the url:/i,
    {},
    { timeout: 30000 },
  );

  return { user, resultLinkInput };
};

describe("WordEncryptor Component", () => {
  beforeEach(() => {
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
    const { resultLinkInput } = await encryptWord("HELLO");

    expect(resultLinkInput).toBeInTheDocument();
    const linkValue = (resultLinkInput as HTMLInputElement).value;
    expect(linkValue).toContain("#");
    // Check that the hash contains a valid base64url-encoded protobuf string
    const hashPart = linkValue.split("#")[1];
    expect(hashPart).toBeTruthy();
    expect(hashPart.length).toBeGreaterThan(10); // Should be a substantial encoded string
    // Verify it's valid base64url format (no +, /, or = characters)
    expect(hashPart).toMatch(/^[A-Za-z0-9_-]+$/);
  }, 30000);

  it("should allow the user to copy the link", async () => {
    const { user } = await encryptWord("COPY");

    const copyButton = await screen.findByRole("button", { name: /copy/i });
    expect(copyButton).toBeInTheDocument();

    await user.click(copyButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /copied!/i }),
      ).toBeInTheDocument();
    });
  }, 30000);

  it("should not encrypt an empty or invalid word", async () => {
    render(<WordEncryptor />);
    const input = screen.getByPlaceholderText("Enter any word");
    const encryptButton = screen.getByRole("button", { name: /Encrypt/i });

    // Test with empty input
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(encryptButton);
    expect(screen.queryByText(/Encrypting progress/i)).not.toBeInTheDocument();

    // Test with invalid characters only
    fireEvent.change(input, { target: { value: "!@#$" } });
    fireEvent.click(encryptButton);
    expect(screen.queryByText(/Encrypting progress/i)).not.toBeInTheDocument();
  });
});
