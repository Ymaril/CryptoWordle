import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import WordInput from "./WordInput";

describe("WordInput Component", () => {
  it("should not allow input when disabled", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<WordInput onSubmit={handleSubmit} length={5} disabled={true} />);

    const input = screen.getByLabelText(/verification input/i);
    await user.type(input, "TEST");

    // The underlying value state should not change, and onSubmit should not be called
    expect(input).toHaveValue("");
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit with the uppercase word when completed", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<WordInput onSubmit={handleSubmit} length={5} />);

    const input = screen.getByLabelText(/verification input/i);
    await user.type(input, "react");

    expect(handleSubmit).toHaveBeenCalledWith("REACT");
  });
});
