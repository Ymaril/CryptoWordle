import "./App.css";
import { LetterBox } from "@/shared/ui";

export function App() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: 20 }}>
      <LetterBox letter="A" status="correct" />
      <LetterBox letter="B" status="misplaced" />
      <LetterBox letter="C" status="wrong" />
      <LetterBox letter="D" />
    </div>
  );
}
