import GuessInputRow from "@/features/guessInputRow";
import "./App.css";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <GuessInputRow
        length={5}
        onSubmit={(word) => {
          console.log("Guess submitted:", word);
        }}
      />
    </div>
  );
}
