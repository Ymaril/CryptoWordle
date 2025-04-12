import GuessInputRow from "@/features/guessInputRow";
import "./App.css";
import { GuessResultRow } from "@/entities/word";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <GuessInputRow
        length={5}
        onSubmit={(word) => {
          console.log("Guess submitted:", word);
        }}
      />
      <div style={{ padding: 20 }}>
        <GuessResultRow
          word="REACT"
          statuses={['correct', 'wrong', 'misplaced', 'wrong', 'correct']}
        />
      </div>
    </div>
  );
}
