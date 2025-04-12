import { useState } from "react";
import VerificationInput from "react-verification-input";
import styles from "./WordInput.module.css";

interface WordInputProps {
  onSubmit: (word: string) => void;
  clearOnSubmit?: boolean;
}

const LENGTH = 5;

export default function WordInput({
  onSubmit,
  clearOnSubmit = true,
}: WordInputProps) {
  const [value, setValue] = useState("");

  const handleChange = (val: string) => {
    const upper = val
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, LENGTH);
    setValue(upper);
  };

  const handleComplete = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z]/g, "");
    onSubmit(clean);
    clearOnSubmit && setValue("");
  };

  return (
    <VerificationInput
      value={value}
      onChange={handleChange}
      onComplete={handleComplete}
      length={LENGTH}
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
