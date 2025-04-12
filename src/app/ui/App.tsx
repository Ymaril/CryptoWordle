import { Word } from "@/entities/word";
import "./App.css";
import { useEffect, useState } from "react";

export default function App() {
  const [word] = useState(() => new Word("HELLO"));
  const [progress, setProgress] = useState(0);
  const [letterProgresses, setLetterProgresses] = useState<number[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const sub = word.getProgress$().subscribe(({ progress }) => {
      setProgress(progress);
    });

    const letterSubs = word.getLetterProgressStreams().map((stream$, i) =>
      stream$.subscribe(p => {
        setLetterProgresses(prev => {
          const next = [...prev];
          next[i] = p.progress;
          return next;
        });
      })
    );

    return () => {
      sub.unsubscribe();
      letterSubs.forEach(s => s.unsubscribe());
    };
  }, [word]);

  const handleStart = () => {
    word.encrypt();
    setStarted(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Шифрование слова</h1>

      <button onClick={handleStart} disabled={started}>
        {started ? "Шифруется..." : "Начать шифрование"}
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>Общий прогресс: {Math.round(progress * 100)}%</strong>
      </div>

      <div style={{ marginTop: 10 }}>
        {letterProgresses.map((p, i) => (
          <div key={i}>
            Буква {i + 1}: {Math.round(p * 100)}%
          </div>
        ))}
      </div>
    </div>
  );
}
