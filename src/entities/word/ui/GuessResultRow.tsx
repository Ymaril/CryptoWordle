import LetterBox from '@/shared/ui/letterBox';
import type { LetterStatus } from '../';
import styles from './GuessResultRow.module.css';

interface GuessResultRowProps {
  word: string;
  statuses: LetterStatus[];
}

export default function GuessResultRow({ word, statuses }: GuessResultRowProps) {
  const letters = word.split('');

  return (
    <div className={styles.row}>
      {letters.map((letter, idx) => (
        <LetterBox key={idx} letter={letter} status={statuses[idx]} />
      ))}
    </div>
  );
}

export type { GuessResultRowProps };
