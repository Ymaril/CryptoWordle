import { render, screen, waitFor } from "@testing-library/react";
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
    expect(linkValue).toContain("ey");
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
});
