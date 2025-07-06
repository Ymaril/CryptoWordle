import { useState } from "react";
import VerificationInput from "react-verification-input";
import styles from "./WordInput.module.css";

interface WordInputProps {
  onSubmit: (word: string) => void;
  length: number;
  clearOnSubmit?: boolean;
  disabled?: boolean;
}

export default function WordInput({
  onSubmit,
  length,
  clearOnSubmit = true,
  disabled = false,
}: WordInputProps) {
  const [value, setValue] = useState("");

  const handleChange = (val: string) => {
    if (disabled) return;

    const upper = val
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, length);
    setValue(upper);
  };

  const handleComplete = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z]/g, "");
    onSubmit(clean);
    if (clearOnSubmit) {
      setValue("");
    }
  };

  return (
    <VerificationInput
      value={value}
      onChange={handleChange}
      onComplete={handleComplete}
      length={length}
      validChars="A-Za-z"
      placeholder=""
      autoFocus
      classNames={{
        container: styles.container,
        character: styles.character,
        characterInactive: styles.inactive,
      }}
    />
  );
}
