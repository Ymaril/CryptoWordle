import { useEffect, useState } from "react";
import { WordInput, Word } from "@/entities/word";
import styles from "./WordEncryptor.module.css";

export default function WordEncryptor() {
  const [word, setWord] = useState<Word | null>(null);
  const [progress, setProgress] = useState(0);
  const [encoded, setEncoded] = useState<string | null>(null);
  const [letterProgresses, setLetterProgresses] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (text: string) => {
    const newWord = new Word(text);
    setWord(newWord);
    setProgress(0);
    setEncoded(null);
    setLetterProgresses(Array(text.length).fill(0));
    setCopied(false);
    newWord.encrypt();
  };

  useEffect(() => {
    if (!word) return;

    const sub = word.getProgress$().subscribe(({ progress, result }) => {
      setProgress(progress);
      if (result) {
        const hash = result.toBase64Url();
        setEncoded(hash);
        window.location.hash = hash;
      }
    });

    return () => sub.unsubscribe();
  }, [word]);

  useEffect(() => {
    if (!word) return;

    const letterStreams = word.getLetterProgressStreams();
    const subs = letterStreams.map((stream$, index) =>
      stream$.subscribe(({ progress }) => {
        setLetterProgresses((prev) => {
          const next = [...prev];
          next[index] = progress;
          return next;
        });
      })
    );

    return () => subs.forEach((sub) => sub.unsubscribe());
  }, [word]);

  const link = encoded ? `${window.location.origin}/#${encoded}` : "";

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <WordInput onSubmit={handleSubmit} clearOnSubmit={false} />

      {word && (
        <div className={styles.progressRow}>
          <div>
            Прогресс шифрования: <span className={styles.progressValue}>{Math.round(progress * 100)}%</span>
          </div>

          {letterProgresses.length > 0 && (
            <div className={styles.letterProgress}>
              <div>Прогресс по буквам:</div>
              <div className={styles.letterList}>
                {letterProgresses.map((p, i) => (
                  <div key={i} className={styles.letterBox}>
                    {Math.round(p * 100)}%
                  </div>
                ))}
              </div>
            </div>
          )}

          {encoded && (
            <div className={styles.linkWrapper}>
              <label htmlFor="link" className={styles.linkLabel}>
                Ссылка:
              </label>
              <div className={styles.linkRow}>
                <input
                  id="link"
                  type="text"
                  readOnly
                  value={link}
                  className={styles.linkInput}
                  onFocus={(e) => e.target.select()}
                />
                <button onClick={handleCopy} className={styles.copyButton}>
                  {copied ? "Скопировано!" : "Копировать"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
