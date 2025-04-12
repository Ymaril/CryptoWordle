import GameBoard from "@/widgets/gameBoard/GameBoard";
import "./App.css";
import styles from "./App.module.css";
import WordEncryptor from "@/features/wordEncryptor";

export default function App() {
  return (
    <div className={styles.container}>
      <div className={styles.center}>
        <GameBoard />
      </div>
      <div className={styles.bottom}>
        <WordEncryptor />
      </div>
    </div>
  );
}
