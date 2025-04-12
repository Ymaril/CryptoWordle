import GameBoard from "@/widgets/gameBoard/GameBoard";
import "./App.css";
import WordEncryptor from "@/features/wordEncryptor";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <GameBoard />
      <WordEncryptor />
    </div>
  );
}
