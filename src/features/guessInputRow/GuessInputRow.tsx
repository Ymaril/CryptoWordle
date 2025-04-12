import { useState } from "react";
import ReactCodeInput from "react-code-input";

interface GuessInputRowProps {
  length: number;
  onSubmit: (guess: string) => void;
  disabled?: boolean;
}

export default function GuessInputRow({
  length,
  onSubmit,
  disabled,
}: GuessInputRowProps) {
  const [value, setValue] = useState("");

  const handleChange = (val: string) => {
    const upper = val.toUpperCase();
    setValue(upper);
    if (upper.length === length) {
      onSubmit(upper);
    }
  };

  return (
    <ReactCodeInput
      name="guess"
      type="text"
      inputMode="latin"
      fields={length}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      inputStyle={{
        width: "48px",
        height: "48px",
        margin: "4px",
        fontSize: "24px",
        textAlign: "center",
        textTransform: "uppercase",
        fontWeight: "bold",
        border: "1px solid #999",
        borderRadius: "4px",
      }}
    />
  );
}
