import { useState } from 'react';
import VerificationInput from 'react-verification-input';
import styles from './GuessInputRow.module.css';

interface GuessInputRowProps {
  length: number;
  onSubmit: (word: string) => void;
  disabled?: boolean;
}

export default function GuessInputRow({ length, onSubmit }: GuessInputRowProps) {
  const [value, setValue] = useState('');

  const handleChange = (val: string) => {
    const upper = val.toUpperCase().replace(/[^A-Z]/g, '').slice(0, length);
    setValue(upper);
  };

  const handleComplete = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z]/g, '');
    onSubmit(clean);
    setValue('');
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

export type { GuessInputRowProps };
