import "./App.css";
import GuessRow from "@/features/guessRow";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <GuessRow
        word="REACT"
        statuses={["correct", "wrong", "misplaced", "default", "default"]}
      />
      <br />
      <GuessRow word="NODE" />
    </div>
  );
}
