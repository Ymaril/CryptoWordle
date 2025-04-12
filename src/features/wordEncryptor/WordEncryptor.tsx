import { useEffect, useState } from "react";
import { WordInput, Word } from "@/entities/word";

export default function WordEncryptor() {
  const [word, setWord] = useState<Word | null>(null);
  const [progress, setProgress] = useState(0);
  const [encoded, setEncoded] = useState<string | null>(null);
  const [letterProgresses, setLetterProgresses] = useState<number[]>([]);

  const handleSubmit = (text: string) => {
    const newWord = new Word(text);
    setWord(newWord);
    setProgress(0);
    setEncoded(null);
    setLetterProgresses(Array(text.length).fill(0));
    newWord.encrypt();
  };

  // Общий прогресс + результат
  useEffect(() => {
    if (!word) return;

    const sub = word.getProgress$().subscribe(({ progress, result }) => {
      setProgress(progress);
      if (result) {
        setEncoded(result.toBase64Url());
      }
    });

    return () => sub.unsubscribe();
  }, [word]);

  // Прогресс по каждой букве
  useEffect(() => {
    if (!word) return;

    const letterStreams = word.getLetterProgressStreams();
    const subs = letterStreams.map((stream$, index) =>
      stream$.subscribe(({ progress }) => {
        setLetterProgresses(prev => {
          const next = [...prev];
          next[index] = progress;
          return next;
        });
      })
    );

    return () => subs.forEach(sub => sub.unsubscribe());
  }, [word]);

  return (
    <div>
      <WordInput onSubmit={handleSubmit} clearOnSubmit={false} />

      {word && (
        <div style={{ marginTop: 16 }}>
          <div>
            Прогресс шифрования: <strong>{Math.round(progress * 100)}%</strong>
          </div>

          {letterProgresses.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div>Прогресс по буквам:</div>
              <div style={{ display: "flex", gap: 8 }}>
                {letterProgresses.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      minWidth: 32,
                      textAlign: "center",
                    }}
                  >
                    {Math.round(p * 100)}%
                  </div>
                ))}
              </div>
            </div>
          )}

          {encoded && (
            <div style={{ marginTop: 12 }}>
              <div>Итог (base64url):</div>
              <code style={{ wordBreak: "break-all" }}>{encoded}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
