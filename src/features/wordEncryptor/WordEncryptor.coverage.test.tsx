import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WordEncryptor from "./WordEncryptor";

describe("WordEncryptor Coverage", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn(),
      },
      writable: true,
    });
  });

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
