import LetterBox, { LetterStatus } from '@/shared/ui/letterBox';
import styles from './GuessRow.module.css';

interface GuessRowProps {
  word: string;
  statuses?: LetterStatus[];
  wordLength?: number;
}

export default function GuessRow({ word, statuses = [], wordLength = 5 }: GuessRowProps) {
  const letters = word.padEnd(wordLength).split('');

  return (
    <div className={styles.row}>
      {letters.map((letter, idx) => (
        <LetterBox key={idx} letter={letter} status={statuses[idx] || 'default'} />
      ))}
    </div>
  );
};